# Database Design — Seruput & Kunyah

- **Status:** Draft konseptual, belum menjadi schema/migration siap jalan.
- **Database target:** PostgreSQL di Supabase.
- **Asumsi stok MVP:** stok produk jadi, bukan bahan baku.

## 1. Entitas awal

### `profiles`
Profil aplikasi yang terkait dengan identitas Supabase Auth:
- `id` — UUID terkait `auth.users.id`
- `display_name`
- `role` — misalnya `admin` atau `cashier`
- `created_at`, `updated_at`

Role harus ditetapkan melalui jalur tepercaya. Pengguna tidak boleh mengubah role sendiri.

### `categories`
- `id`
- `name`
- `slug` (unik bila digunakan)
- `created_at`, `updated_at`

### `products`
- `id`
- `category_id` (opsional, FK ke categories)
- `name`
- `description`
- `price`
- `image_url`
- `is_active`
- `created_at`, `updated_at`

Validasi: harga tidak negatif. Gunakan integer satuan rupiah atau `numeric` dengan presisi yang ditetapkan; jangan gunakan floating point untuk nilai uang.

### `inventory`
- `product_id` (PK sekaligus FK ke products)
- `quantity_on_hand` (integer, tidak boleh negatif)
- `updated_at`

### `stock_movements`
- `id`
- `product_id`
- `movement_type` — misalnya `sale`, `adjustment`, `return`
- `quantity_delta`
- `reason`
- `reference_transaction_id` (opsional)
- `created_by`
- `created_at`

Pergerakan stok harus dibuat melalui operasi berwenang. Riwayat movement tidak boleh diedit bebas.

### `transactions`
- `id`
- `transaction_number` (unik)
- `created_by`
- `status` — misalnya `completed`, `cancelled`, `refunded`
- `payment_method`
- `payment_status`
- `subtotal`
- `discount_total` (bila diskon diterapkan)
- `grand_total`
- `idempotency_key` (unik dalam cakupan yang ditetapkan)
- `created_at`

Status dan aturan refund perlu difinalisasi sebelum implementasi.

### `transaction_items`
- `id`
- `transaction_id`
- `product_id`
- `product_name_snapshot`
- `unit_price_snapshot`
- `quantity`
- `line_total`

Snapshot menyimpan keadaan produk saat transaksi, sehingga perubahan nama/harga tidak mengubah riwayat.

## 2. Relasi konseptual

```text
auth.users 1 ── 1 profiles
categories 1 ── N products
products   1 ── 1 inventory
products   1 ── N stock_movements
transactions 1 ── N transaction_items
products   1 ── N transaction_items
transactions 1 ── N stock_movements (referensi opsional)
profiles   1 ── N transactions
```

## 3. Aturan integritas
- Foreign key menjaga relasi.
- `quantity_on_hand >= 0`.
- `transaction_items.quantity > 0`.
- Harga dan total tidak negatif, kecuali model refund yang disepakati memerlukan representasi berbeda.
- Nomor transaksi unik.
- Idempotency key mencegah checkout yang sama diproses dua kali.
- Checkout dan pengurangan stok berjalan dalam satu transaksi database.
- Total dihitung dari harga database, bukan total kiriman client.
- Perubahan stok harus tercatat.
- Produk dengan riwayat transaksi sebaiknya dinonaktifkan, bukan dihapus.

## 4. Keamanan dan RLS
RLS harus aktif pada tabel yang dapat diakses melalui Supabase API. Kebijakan final harus ditulis dan diuji per operasi (`SELECT`, `INSERT`, `UPDATE`, `DELETE`).

Prinsip awal:
- Publik hanya membaca produk aktif yang ditampilkan di website.
- Admin mengelola produk dan laporan sesuai role.
- Kasir menjalankan operasi POS dan melihat data yang dibutuhkan sesuai kebijakan bisnis.
- Pengguna tidak membaca atau mengubah data tanpa izin.
- Checkout berjalan melalui fungsi tepercaya dengan validasi role dan parameter ketat.
- Service-role key tidak boleh ada di frontend.

Prinsip ini belum merupakan SQL final.

## 5. Sebelum membuat migrasi
1. Audit model produk dan transaksi yang sudah ada.
2. Konfirmasi stok produk jadi atau bahan baku.
3. Konfirmasi varian, diskon, pembayaran, pembatalan, dan refund.
4. Tentukan strategi seed data dan migrasi data lama.
5. Buat migrasi versi kontrol di repository.
6. Uji di database development, bukan langsung produksi.
