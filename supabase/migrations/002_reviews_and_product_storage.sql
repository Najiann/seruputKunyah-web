-- ============================================================================
-- SERUPUT & KUNYAH — Migration 002: Customer Reviews & Product Images Storage
-- ============================================================================
-- Jalankan script ini di Supabase Dashboard -> SQL Editor -> New Query -> Run.
-- Aman dijalankan ulang (idempotent).
--
-- Menambahkan:
--   1. Tabel public.reviews (ulasan, rating 1-5, kritik & saran pelanggan)
--   2. Kebijakan RLS untuk public.reviews (publik bisa baca & kirim; admin moderasi)
--   3. Bucket Supabase Storage 'product-images' (publik baca; admin upload/ubah/hapus)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABEL PUBLIC.REVIEWS
-- ----------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(trim(customer_name)) >= 2 and char_length(customer_name) <= 80),
  role_or_affiliation text not null default 'Pelanggan',
  rating integer not null check (rating between 1 and 5),
  menu_bought text not null check (char_length(trim(menu_bought)) >= 1 and char_length(menu_bought) <= 250),
  comment text not null check (char_length(trim(comment)) >= 3 and char_length(comment) <= 1000),
  suggestion text not null default '',
  is_published boolean not null default true,
  is_verified boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_created_at on public.reviews(created_at desc);
create index if not exists idx_reviews_published on public.reviews(is_published);

-- ----------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS) UNTUK REVIEWS
-- ----------------------------------------------------------------------------
alter table public.reviews enable row level security;

-- Publik hanya melihat ulasan yang dipublikasikan; admin & kasir melihat semua ulasan
drop policy if exists "reviews_public_or_staff_select" on public.reviews;
create policy "reviews_public_or_staff_select" on public.reviews
  for select using (
    is_published = true
    or public.current_user_role() in ('admin', 'cashier')
  );

-- Pengunjung publik boleh mengirim ulasan baru dengan validasi dasar
drop policy if exists "reviews_public_insert" on public.reviews;
create policy "reviews_public_insert" on public.reviews
  for insert with check (
    rating between 1 and 5
    and is_published = true
    and char_length(trim(customer_name)) >= 2
    and char_length(trim(comment)) >= 3
  );

-- Hanya admin yang boleh menyembunyikan/menampilkan/mengubah ulasan
drop policy if exists "reviews_admin_update" on public.reviews;
create policy "reviews_admin_update" on public.reviews
  for update using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Hanya admin yang boleh menghapus ulasan
drop policy if exists "reviews_admin_delete" on public.reviews;
create policy "reviews_admin_delete" on public.reviews
  for delete using (public.current_user_role() = 'admin');

-- ----------------------------------------------------------------------------
-- 3. SUPABASE STORAGE BUCKET: product-images (Foto Produk)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  3145728, -- 3 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 3145728,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- Publik boleh melihat foto produk di website toko
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');

-- Hanya admin yang boleh upload foto produk baru
drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and public.current_user_role() = 'admin'
  );

-- Hanya admin yang boleh menimpa/update foto produk
drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'product-images'
    and public.current_user_role() = 'admin'
  )
  with check (
    bucket_id = 'product-images'
    and public.current_user_role() = 'admin'
  );

-- Hanya admin yang boleh menghapus foto produk di bucket
drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'product-images'
    and public.current_user_role() = 'admin'
  );
