-- Meow's Heart database schema for Supabase (Postgres)
-- Run this in Supabase Dashboard -> SQL Editor -> New query -> Run.

create extension if not exists "pgcrypto";

-- ============ PROFILES ============
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  is_admin boolean not null default false,
  loyalty_points integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);

create policy "Profiles are updatable by owner" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create policy "Admins can view all profiles" on public.profiles
  for select using (public.is_admin());

create policy "Admins can update all profiles" on public.profiles
  for update using (public.is_admin());

-- ============ CATEGORIES ============
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Categories are viewable by everyone" on public.categories
  for select using (true);

create policy "Admins manage categories" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ============ PRODUCTS ============
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price_mmk integer not null check (price_mmk >= 0),
  compare_at_price_mmk integer check (compare_at_price_mmk >= 0),
  image_url text,
  images text[],
  category_id uuid references public.categories(id) on delete set null,
  origin_country text,
  stock integer not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Active products are viewable by everyone" on public.products
  for select using (is_active = true or public.is_admin());

create policy "Admins manage products" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- ============ ORDERS ============
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','paid','shipped','completed','cancelled')),
  subtotal_mmk integer not null default 0,
  total_mmk integer not null default 0,
  shipping_name text not null,
  shipping_phone text not null,
  shipping_address text not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Users view own orders" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

create policy "Users create own orders" on public.orders
  for insert with check (auth.uid() = user_id);

create policy "Admins update orders" on public.orders
  for update using (public.is_admin());

-- ============ ORDER ITEMS ============
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price_mmk integer not null,
  quantity integer not null check (quantity > 0)
);

alter table public.order_items enable row level security;

create policy "Users view own order items" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );

create policy "Users insert items for own order" on public.order_items
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
  );

-- ============ LOYALTY TRANSACTIONS ============
create table if not exists public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  paws integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

alter table public.loyalty_transactions enable row level security;

create policy "Users view own loyalty transactions" on public.loyalty_transactions
  for select using (auth.uid() = user_id or public.is_admin());

-- Award 1 paw per 30,000 MMK spent whenever an order is marked completed/paid.
create or replace function public.award_loyalty_paws()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  paws_earned integer;
begin
  if new.status in ('paid','completed') and (old.status is distinct from new.status) then
    paws_earned := floor(new.total_mmk / 30000);
    if paws_earned > 0 then
      insert into public.loyalty_transactions (user_id, order_id, paws, reason)
      values (new.user_id, new.id, paws_earned, 'Order ' || new.id);

      update public.profiles
        set loyalty_points = loyalty_points + paws_earned
        where id = new.user_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_order_status_change on public.orders;
create trigger on_order_status_change
  after update on public.orders
  for each row execute procedure public.award_loyalty_paws();

-- ============ CONSULTATION BOOKINGS ============
create table if not exists public.consultation_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  consultation_type text not null,
  full_name text not null,
  phone text not null,
  preferred_date date,
  preferred_time text,
  notes text,
  status text not null default 'pending' check (status in ('pending','confirmed','completed','cancelled')),
  created_at timestamptz not null default now()
);

alter table public.consultation_bookings enable row level security;

create policy "Anyone can book a consultation" on public.consultation_bookings
  for insert with check (true);

create policy "Users view own bookings" on public.consultation_bookings
  for select using (auth.uid() = user_id or public.is_admin());

create policy "Admins manage bookings" on public.consultation_bookings
  for update using (public.is_admin());

-- ============ CONTACT MESSAGES ============
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "Anyone can send a contact message" on public.contact_messages
  for insert with check (true);

create policy "Admins view contact messages" on public.contact_messages
  for select using (public.is_admin());

create policy "Admins update contact messages" on public.contact_messages
  for update using (public.is_admin());

-- ============ SEED DATA (sample categories + products) ============
insert into public.categories (name, slug) values
  ('Skincare', 'skincare'),
  ('Makeup', 'makeup'),
  ('K-Beauty', 'k-beauty'),
  ('Hair Care', 'hair-care')
on conflict (slug) do nothing;

insert into public.products (name, slug, description, price_mmk, compare_at_price_mmk, image_url, category_id, origin_country, stock, is_featured)
select
  v.name, v.slug, v.description, v.price_mmk, v.compare_at_price_mmk, v.image_url,
  (select id from public.categories where slug = v.category_slug),
  v.origin_country, v.stock, v.is_featured
from (values
  ('Korean Glow Essence', 'korean-glow-essence', 'A lightweight, oil-controlling essence that gives your skin a natural dewy glow.', 25000, 32000, null, 'skincare', 'Korea', 40, true),
  ('Snail Repair Cream', 'snail-repair-cream', 'Rich repair cream with snail mucin to soothe and hydrate tired skin.', 28000, null, null, 'skincare', 'Korea', 25, true),
  ('Velvet Matte Lipstick', 'velvet-matte-lipstick', 'Long-wearing matte lipstick in a range of flattering shades.', 15000, 18000, null, 'makeup', 'Thailand', 60, true),
  ('Cushion Foundation SPF50', 'cushion-foundation-spf50', 'Buildable cushion foundation with SPF50 sun protection.', 22000, null, null, 'makeup', 'Korea', 35, true),
  ('Centella Calming Toner', 'centella-calming-toner', 'Alcohol-free toner with centella asiatica to calm sensitive skin.', 18000, null, null, 'k-beauty', 'Korea', 50, false),
  ('Rice Water Shampoo', 'rice-water-shampoo', 'Gentle shampoo infused with fermented rice water for shine and strength.', 12000, null, null, 'hair-care', 'Thailand', 45, false)
) as v(name, slug, description, price_mmk, compare_at_price_mmk, image_url, category_slug, origin_country, stock, is_featured)
on conflict (slug) do nothing;
