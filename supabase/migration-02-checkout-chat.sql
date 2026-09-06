-- Meow's Heart — migration 02: checkout payment method, order status
-- rework, KPay receipts, and the customer-service chat tables.
-- Run this in Supabase Dashboard -> SQL Editor -> New query -> Run,
-- AFTER schema.sql and storage-setup.sql have already been run once.

-- ============ ORDERS: payment method + delivery city + receipts ============
alter table public.orders add column if not exists payment_method text;
alter table public.orders add column if not exists kpay_receipt_url text;
alter table public.orders add column if not exists delivery_city text;

-- ============ ORDERS: new status vocabulary ============
-- Old:  pending | paid | shipped | completed | cancelled
-- New:  awaiting_confirmation | processing | shipped | completed | cancelled
--   awaiting_confirmation — Cash on Delivery order, waiting on an admin
--                           to confirm it before it's prepared
--   processing            — payment is in (KPay receipt uploaded, or an
--                           admin confirmed a COD order) and it's being
--                           prepared; this is also the moment loyalty
--                           paws are awarded (see the trigger below)
-- migrate any existing rows before the new check constraint below
do $$
begin
  update public.orders set status = 'awaiting_confirmation' where status = 'pending';
  update public.orders set status = 'processing' where status = 'paid';
end $$;

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('awaiting_confirmation','processing','shipped','completed','cancelled'));
alter table public.orders alter column status set default 'awaiting_confirmation';

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method is null or payment_method in ('kpay','cod'));

-- Award 1 paw per 30,000 MMK spent the moment an order enters
-- "processing" (that's the payment-confirmed moment for both an
-- auto-accepted KPay order and an admin-confirmed COD order) rather
-- than the old 'paid'/'completed' pair, so paws are awarded exactly
-- once per order.
create or replace function public.award_loyalty_paws()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  paws_earned integer;
begin
  if new.status = 'processing' and (old.status is distinct from new.status) then
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

-- ============ PROFILES: capture phone at registration ============
-- (profiles.phone already existed in schema.sql; this just makes the
-- signup trigger also fill it in from the auth signup metadata.)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'phone')
  on conflict (id) do nothing;
  return new;
end;
$$;

-- ============ PAYMENT RECEIPTS (private storage bucket) ============
insert into storage.buckets (id, name, public)
values ('payment-receipts', 'payment-receipts', false)
on conflict (id) do nothing;

drop policy if exists "Users upload own receipts" on storage.objects;
create policy "Users upload own receipts" on storage.objects
  for insert with check (
    bucket_id = 'payment-receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users view own receipts" on storage.objects;
create policy "Users view own receipts" on storage.objects
  for select using (
    bucket_id = 'payment-receipts'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- ============ SUPPORT CHAT ============
-- A lightweight two-way chat, separate from the one-shot "Contact Us"
-- form (contact_messages). Each signed-in customer has one ongoing
-- conversation; a rule-based bot (no external AI API — see
-- src/lib/supportBot.ts) answers instantly from the customer's own
-- browser, and an admin can step in at any point.
create table if not exists public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'open' check (status in ('open','pending_admin','closed')),
  -- 0 = low (bot has it handled / resolved), 1 = medium (waiting on a
  -- human), 2 = high (waiting on a human AND looks urgent) — see the
  -- trigger below for how this gets set automatically.
  priority integer not null default 0,
  human_engaged boolean not null default false,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.support_conversations enable row level security;

create policy "Users view own conversation" on public.support_conversations
  for select using (auth.uid() = user_id or public.is_admin());

create policy "Users create own conversation" on public.support_conversations
  for insert with check (auth.uid() = user_id);

create policy "Users and admins update conversation" on public.support_conversations
  for update using (auth.uid() = user_id or public.is_admin());

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender text not null check (sender in ('customer','ai','admin')),
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.support_messages enable row level security;

create policy "Users view own conversation messages" on public.support_messages
  for select using (
    exists (
      select 1 from public.support_conversations c
      where c.id = conversation_id and (c.user_id = auth.uid() or public.is_admin())
    )
  );

-- Customers can insert their own messages AND the bot's canned reply
-- to them (the bot runs client-side, no server function involved),
-- but only into their own conversation.
create policy "Users post to own conversation" on public.support_messages
  for insert with check (
    sender in ('customer','ai')
    and exists (
      select 1 from public.support_conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

create policy "Admins post to any conversation" on public.support_messages
  for insert with check (public.is_admin() and sender = 'admin');

-- Keep the parent conversation's priority/status/last_message_at in
-- sync whenever a message is added, so the admin inbox can just sort
-- by (priority desc, last_message_at asc) with no extra computation.
create or replace function public.touch_support_conversation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  urgent boolean;
begin
  if new.sender = 'customer' then
    urgent := new.body ~* '(urgent|refund|cancel|angry|complain|problem|wrong|broken|not received|help|scam)';
    update public.support_conversations
      set last_message_at = new.created_at,
          status = 'pending_admin',
          priority = case when urgent then 2 else greatest(priority, 1) end
      where id = new.conversation_id;
  elsif new.sender = 'admin' then
    update public.support_conversations
      set last_message_at = new.created_at,
          status = 'open',
          priority = 0,
          human_engaged = true
      where id = new.conversation_id;
  else
    -- 'ai' reply: only counts as "handled" if a human hasn't already
    -- taken over this conversation.
    update public.support_conversations
      set last_message_at = new.created_at,
          priority = case when human_engaged then priority else 0 end
      where id = new.conversation_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_support_message_insert on public.support_messages;
create trigger on_support_message_insert
  after insert on public.support_messages
  for each row execute procedure public.touch_support_conversation();

-- ============ REALTIME ============
-- So the customer widget and admin inbox both get live updates without
-- polling (used via supabase.channel(...).on('postgres_changes', ...)).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'support_messages'
  ) then
    alter publication supabase_realtime add table public.support_messages;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'support_conversations'
  ) then
    alter publication supabase_realtime add table public.support_conversations;
  end if;
end $$;
