-- Storage bucket + policies for uploading product images from the
-- admin panel (Admin > Products > New/Edit > "Upload image").
--
-- Run this once in your Supabase project's SQL Editor, the same place
-- you ran schema.sql. Safe to re-run — it drops and recreates its own
-- policies rather than erroring if they already exist.

-- Public bucket: anyone can view/download the images (that's what you
-- want for product photos shown in the shop), but only admins can
-- upload, replace, or delete files in it.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());
