-- ============================================================================
-- SERUPUT & KUNYAH — Supabase PostgreSQL Initial Schema, RLS & Atomic RPCs
-- ============================================================================
-- Jalankan seluruh script ini di Supabase Dashboard -> SQL Editor -> New Query.
-- Aman dijalankan ulang (idempotent) di database development.
--
-- Mencakup 7 tabel inti:
--   1. public.profiles          (1:1 auth.users)
--   2. public.categories        (1:N products)
--   3. public.products          (1:1 inventory, 1:N stock_movements & transaction_items)
--   4. public.inventory         (quantity_on_hand >= 0)
--   5. public.stock_movements   (immutable audit trail)
--   6. public.transactions      (header transaksi + idempotency_key unik)
--   7. public.transaction_items (snapshot nama & harga saat transaksi)
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROFILES (terkait 1:1 dengan auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'cashier' check (role in ('admin', 'cashier')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helper role check (SECURITY DEFINER agar RLS tidak recursive)
create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Trigger otomatis membuat profile saat user baru dibuat di auth.users
-- Role default selalu 'cashier'; promosi ke 'admin' hanya lewat SQL/jalur tepercaya
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1)),
    'cashier'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. CATEGORIES
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. PRODUCTS
-- ----------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text not null default '',
  price integer not null check (price >= 0),
  image_url text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. INVENTORY (1:1 dengan products)
-- ----------------------------------------------------------------------------
create table if not exists public.inventory (
  product_id uuid primary key references public.products(id) on delete cascade,
  quantity_on_hand integer not null default 0 check (quantity_on_hand >= 0),
  updated_at timestamptz not null default now()
);

-- Trigger otomatis membuat baris inventory = 0 setiap produk baru dibuat
create or replace function public.handle_new_product_inventory()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.inventory (product_id, quantity_on_hand)
  values (new.id, 0)
  on conflict (product_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_product_created_init_inventory on public.products;
create trigger on_product_created_init_inventory
  after insert on public.products
  for each row execute function public.handle_new_product_inventory();

-- ----------------------------------------------------------------------------
-- 5. TRANSACTIONS
-- ----------------------------------------------------------------------------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_number text not null unique,
  created_by uuid references public.profiles(id) on delete set null,
  status text not null default 'completed' check (status in ('completed', 'cancelled', 'refunded')),
  payment_method text not null check (payment_method in ('cash', 'qris', 'transfer')),
  payment_status text not null default 'paid' check (payment_status in ('paid', 'pending', 'refunded')),
  subtotal integer not null check (subtotal >= 0),
  discount_total integer not null default 0 check (discount_total >= 0),
  grand_total integer not null check (grand_total >= 0),
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 6. TRANSACTION_ITEMS (Snapshot nama & harga saat transaksi)
-- ----------------------------------------------------------------------------
create table if not exists public.transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name_snapshot text not null,
  unit_price_snapshot integer not null check (unit_price_snapshot >= 0),
  quantity integer not null check (quantity > 0),
  line_total integer not null check (line_total >= 0)
);

-- ----------------------------------------------------------------------------
-- 7. STOCK_MOVEMENTS (Immutable audit trail)
-- ----------------------------------------------------------------------------
create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  movement_type text not null check (movement_type in ('sale', 'adjustment', 'return')),
  quantity_delta integer not null check (quantity_delta <> 0),
  reason text not null default '',
  reference_transaction_id uuid references public.transactions(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Indexes untuk performa query dashboard, POS, dan laporan
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_transactions_created_at on public.transactions(created_at desc);
create index if not exists idx_transactions_status on public.transactions(status);
create index if not exists idx_transaction_items_tx on public.transaction_items(transaction_id);
create index if not exists idx_stock_movements_product on public.stock_movements(product_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.inventory enable row level security;
alter table public.stock_movements enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_items enable row level security;

-- PROFILES: staff (admin/kasir) bisa melihat profil staff; user hanya boleh ubah display_name (role dikunci)
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
drop policy if exists "profiles_select_staff" on public.profiles;
create policy "profiles_select_staff" on public.profiles
  for select using (
    id = auth.uid()
    or public.current_user_role() in ('admin', 'cashier')
  );

drop policy if exists "profiles_update_display_name_only" on public.profiles;
create policy "profiles_update_display_name_only" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = public.current_user_role());

-- CATEGORIES: publik/staff baca semua; admin kelola penuh
drop policy if exists "categories_select_all" on public.categories;
create policy "categories_select_all" on public.categories
  for select using (true);

drop policy if exists "categories_admin_manage" on public.categories;
create policy "categories_admin_manage" on public.categories
  for all using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- PRODUCTS: publik hanya baca produk aktif; admin & kasir baca semua; hanya admin tambah/ubah produk
drop policy if exists "products_public_active_select" on public.products;
create policy "products_public_active_select" on public.products
  for select using (
    is_active = true
    or public.current_user_role() in ('admin', 'cashier')
  );

drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert" on public.products
  for insert with check (public.current_user_role() = 'admin');

drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update" on public.products
  for update using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- INVENTORY: admin & kasir baca stok; perubahan stok hanya melalui RPC atomik
drop policy if exists "inventory_staff_select" on public.inventory;
create policy "inventory_staff_select" on public.inventory
  for select using (public.current_user_role() in ('admin', 'cashier'));

-- STOCK_MOVEMENTS: hanya staff baca; tidak ada policy insert/update/delete langsung (immutable)
drop policy if exists "stock_movements_staff_select" on public.stock_movements;
create policy "stock_movements_staff_select" on public.stock_movements
  for select using (public.current_user_role() in ('admin', 'cashier'));

-- TRANSACTIONS & ITEMS: admin & kasir baca; penulisan hanya lewat RPC tervalidasi
drop policy if exists "transactions_staff_select" on public.transactions;
create policy "transactions_staff_select" on public.transactions
  for select using (public.current_user_role() in ('admin', 'cashier'));

drop policy if exists "transaction_items_staff_select" on public.transaction_items;
create policy "transaction_items_staff_select" on public.transaction_items
  for select using (public.current_user_role() in ('admin', 'cashier'));

-- ----------------------------------------------------------------------------
-- 9. ATOMIC RPC FUNCTIONS (Trusted Server-Side Business Logic)
-- ----------------------------------------------------------------------------

-- A. Checkout POS Atomik (hitung total dari DB, kunci baris stok, idempotent)
create or replace function public.process_pos_checkout(
  p_items jsonb,
  p_payment_method text,
  p_payment_status text default 'paid',
  p_discount_total integer default 0,
  p_idempotency_key text default gen_random_uuid()::text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_existing_tx public.transactions%rowtype;
  v_tx_id uuid;
  v_tx_number text;
  v_subtotal integer := 0;
  v_discount integer := greatest(0, coalesce(p_discount_total, 0));
  v_grand_total integer;
  v_raw_item jsonb;
  v_raw_qty integer;
  v_agg record;
  v_product public.products%rowtype;
  v_on_hand integer;
  v_line_total integer;
begin
  if v_user_id is null then
    raise exception 'Autentikasi diperlukan untuk transaksi POS.';
  end if;

  select role into v_role from public.profiles where id = v_user_id;
  if v_role not in ('admin', 'cashier') then
    raise exception 'Akses ditolak: role tidak memiliki izin POS.';
  end if;

  if p_payment_method not in ('cash', 'qris', 'transfer') then
    raise exception 'Metode pembayaran tidak valid.';
  end if;

  if p_payment_status not in ('paid', 'pending') then
    raise exception 'Status pembayaran tidak valid.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Keranjang POS kosong.';
  end if;

  -- Validasi dasar setiap elemen input
  for v_raw_item in select * from jsonb_array_elements(p_items)
  loop
    v_raw_qty := (v_raw_item ->> 'quantity')::integer;
    if v_raw_qty is null or v_raw_qty <= 0 then
      raise exception 'Kuantitas item harus lebih dari 0.';
    end if;
    if nullif(trim(v_raw_item ->> 'product_id'), '') is null then
      raise exception 'product_id tidak valid.';
    end if;
  end loop;

  -- Idempotency check: kembalikan transaksi jika key sudah pernah diproses
  select * into v_existing_tx from public.transactions where idempotency_key = p_idempotency_key;
  if found then
    return jsonb_build_object(
      'transaction_id', v_existing_tx.id,
      'transaction_number', v_existing_tx.transaction_number,
      'grand_total', v_existing_tx.grand_total,
      'idempotent_replay', true
    );
  end if;

  -- Pass 1: Agregasi per product_id (terurut agar bebas deadlock), kunci inventory, hitung subtotal dari DB
  for v_agg in
    select
      (elem ->> 'product_id')::uuid as product_id,
      sum((elem ->> 'quantity')::integer)::integer as total_qty
    from jsonb_array_elements(p_items) as elem
    group by 1
    order by 1
  loop
    select * into v_product from public.products where id = v_agg.product_id;
    if not found then
      raise exception 'Produk tidak ditemukan.';
    end if;
    if not v_product.is_active then
      raise exception 'Produk % sedang nonaktif dan tidak dapat dijual.', v_product.name;
    end if;

    select quantity_on_hand into v_on_hand
    from public.inventory
    where product_id = v_product.id
    for update;

    if not found or v_on_hand < v_agg.total_qty then
      raise exception 'Stok tidak mencukupi untuk produk % (tersisa %).', v_product.name, coalesce(v_on_hand, 0);
    end if;

    v_subtotal := v_subtotal + (v_product.price * v_agg.total_qty);
  end loop;

  if v_discount > v_subtotal then
    raise exception 'Diskon tidak boleh melebihi subtotal.';
  end if;

  v_grand_total := v_subtotal - v_discount;
  v_tx_number := 'TRX-' || to_char(now() at time zone 'Asia/Jakarta', 'YYYYMMDD-HH24MISS') || '-' || upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 4));

  insert into public.transactions (
    transaction_number, created_by, status, payment_method, payment_status,
    subtotal, discount_total, grand_total, idempotency_key
  ) values (
    v_tx_number, v_user_id, 'completed', p_payment_method, p_payment_status,
    v_subtotal, v_discount, v_grand_total, p_idempotency_key
  ) returning id into v_tx_id;

  -- Pass 2: Simpan item snapshot, kurangi inventory, dan catat stock_movements
  for v_agg in
    select
      (elem ->> 'product_id')::uuid as product_id,
      sum((elem ->> 'quantity')::integer)::integer as total_qty
    from jsonb_array_elements(p_items) as elem
    group by 1
    order by 1
  loop
    select * into v_product from public.products where id = v_agg.product_id;
    v_line_total := v_product.price * v_agg.total_qty;

    insert into public.transaction_items (
      transaction_id, product_id, product_name_snapshot, unit_price_snapshot, quantity, line_total
    ) values (
      v_tx_id, v_product.id, v_product.name, v_product.price, v_agg.total_qty, v_line_total
    );

    update public.inventory
    set quantity_on_hand = quantity_on_hand - v_agg.total_qty,
        updated_at = now()
    where product_id = v_product.id;

    insert into public.stock_movements (
      product_id, movement_type, quantity_delta, reason, reference_transaction_id, created_by
    ) values (
      v_product.id, 'sale', -v_agg.total_qty, 'Penjualan POS ' || v_tx_number, v_tx_id, v_user_id
    );
  end loop;

  return jsonb_build_object(
    'transaction_id', v_tx_id,
    'transaction_number', v_tx_number,
    'grand_total', v_grand_total,
    'idempotent_replay', false
  );
end;
$$;

-- B. Penyesuaian Stok oleh Admin (selalu tercatat di stock_movements)
create or replace function public.adjust_inventory_stock(
  p_product_id uuid,
  p_quantity_delta integer,
  p_movement_type text default 'adjustment',
  p_reason text default ''
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_new_qty integer;
begin
  select role into v_role from public.profiles where id = v_user_id;
  if v_role <> 'admin' then
    raise exception 'Hanya admin yang berwenang menyesuaikan stok.';
  end if;

  if p_movement_type not in ('adjustment', 'return') then
    raise exception 'Tipe mutasi harus adjustment atau return.';
  end if;

  if p_quantity_delta = 0 then
    raise exception 'Perubahan stok tidak boleh 0.';
  end if;

  update public.inventory
  set quantity_on_hand = quantity_on_hand + p_quantity_delta,
      updated_at = now()
  where product_id = p_product_id
  returning quantity_on_hand into v_new_qty;

  if not found then
    if p_quantity_delta < 0 then
      raise exception 'Stok tidak boleh negatif.';
    end if;
    insert into public.inventory (product_id, quantity_on_hand)
    values (p_product_id, p_quantity_delta)
    returning quantity_on_hand into v_new_qty;
  end if;

  if v_new_qty < 0 then
    raise exception 'Stok akhir tidak boleh negatif.';
  end if;

  insert into public.stock_movements (
    product_id, movement_type, quantity_delta, reason, created_by
  ) values (
    p_product_id, p_movement_type, p_quantity_delta, coalesce(nullif(trim(p_reason), ''), 'Penyesuaian manual admin'), v_user_id
  );

  return v_new_qty;
end;
$$;

-- C. Pembatalan / Refund Transaksi oleh Admin (mengembalikan stok secara atomik)
create or replace function public.cancel_or_refund_transaction(
  p_transaction_id uuid,
  p_new_status text,
  p_reason text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_tx public.transactions%rowtype;
  v_item public.transaction_items%rowtype;
begin
  select role into v_role from public.profiles where id = v_user_id;
  if v_role <> 'admin' then
    raise exception 'Hanya admin yang berwenang membatalkan/refund transaksi.';
  end if;

  if p_new_status not in ('cancelled', 'refunded') then
    raise exception 'Status target harus cancelled atau refunded.';
  end if;

  select * into v_tx from public.transactions where id = p_transaction_id for update;
  if not found then
    raise exception 'Transaksi tidak ditemukan.';
  end if;

  if v_tx.status <> 'completed' then
    raise exception 'Hanya transaksi berstatus completed yang dapat dibatalkan/direfund.';
  end if;

  update public.transactions
  set status = p_new_status,
      payment_status = case when p_new_status = 'refunded' then 'refunded' else payment_status end
  where id = p_transaction_id;

  for v_item in select * from public.transaction_items where transaction_id = p_transaction_id
  loop
    update public.inventory
    set quantity_on_hand = quantity_on_hand + v_item.quantity,
        updated_at = now()
    where product_id = v_item.product_id;

    insert into public.stock_movements (
      product_id, movement_type, quantity_delta, reason, reference_transaction_id, created_by
    ) values (
      v_item.product_id,
      'return',
      v_item.quantity,
      coalesce(nullif(trim(p_reason), ''), 'Pengembalian stok (' || p_new_status || ') ' || v_tx.transaction_number),
      p_transaction_id,
      v_user_id
    );
  end loop;
end;
$$;

-- Hak eksekusi RPC: kunci dari publik anonim, izinkan hanya authenticated user (validasi role tetap di dalam fungsi)
revoke all on function public.process_pos_checkout(jsonb, text, text, integer, text) from public;
grant execute on function public.process_pos_checkout(jsonb, text, text, integer, text) to authenticated;

revoke all on function public.adjust_inventory_stock(uuid, integer, text, text) from public;
grant execute on function public.adjust_inventory_stock(uuid, integer, text, text) to authenticated;

revoke all on function public.cancel_or_refund_transaction(uuid, text, text) from public;
grant execute on function public.cancel_or_refund_transaction(uuid, text, text) to authenticated;

grant execute on function public.current_user_role() to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 10. SEED DATA AWAL (Kategori & Menu SERUPUT & KUNYAH)
-- ----------------------------------------------------------------------------
insert into public.categories (name, slug)
values
  ('Makanan', 'food'),
  ('Minuman', 'drink')
on conflict (slug) do nothing;

with food_cat as (select id from public.categories where slug = 'food' limit 1),
     drink_cat as (select id from public.categories where slug = 'drink' limit 1),
     inserted_products as (
       insert into public.products (category_id, name, description, price, image_url, is_active)
       select * from (
         select (select id from food_cat), 'Makaroni Basah', 'Makaroni kenyal hangat berbalut bumbu gurih khas dan rempah cabai pilihan. Cocok dinikmati saat rehat santai.', 8000, '/images/makaroni-basah.jpg', true
         union all
         select (select id from food_cat), 'Makaroni Kering', 'Makaroni goreng renyah kriuk dengan taburan bumbu asin pedas gurih. Camilan wajib teman nugas dan ngobrol.', 8000, '/images/makaroni-kering.jpg', true
         union all
         select (select id from drink_cat), 'Es Teh Manis', 'Seduhan teh melati wangi dengan rasa manis pas dan dingin menyegarkan. Penghilang dahaga paling pas sehabis nyemil.', 4000, '/images/es-teh.jpg', true
         union all
         select (select id from drink_cat), 'Es Teh Lemon', 'Kombinasi teh aromatik dingin dengan perasan dan irisan lemon segar. Sensasi asam manis yang langsung melegakan.', 6000, '/images/es-teh-lemon.jpg', true
       ) as seed_rows
       where not exists (select 1 from public.products limit 1)
       returning id
     )
insert into public.inventory (product_id, quantity_on_hand)
select id, 50 from inserted_products
on conflict (product_id) do nothing;
