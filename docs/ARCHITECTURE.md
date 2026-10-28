# Architecture — Seruput & Kunyah

- **Status:** Draft, menunggu audit repository
- **Frontend hosting:** Vercel
- **Rencana data/auth:** Supabase

## 1. Komponen target

```text
Browser
  └── React + TypeScript + Vite (Vercel)
        ├── Website publik
        ├── Admin dashboard
        └── POS
              ├── Supabase Auth
              └── Supabase API / PostgreSQL
                    ├── products, categories
                    ├── inventory, stock_movements
                    ├── transactions, transaction_items
                    └── RLS policies + checkout function
```

Arsitektur ini adalah target sementara. Arsitektur aktual harus diverifikasi dari source code sebelum implementasi.

## 2. Batas kepercayaan
Frontend tidak tepercaya untuk harga, total, stok, role, dan hasil checkout. Pengguna dapat memodifikasi request dari browser.

- Frontend hanya memakai publishable/anon key yang dirancang untuk penggunaan publik.
- Secret/service-role key dan kredensial database tidak boleh masuk ke bundle frontend atau repository.
- Akses tabel dibatasi dengan Row Level Security (RLS).
- Pengguna tidak boleh menaikkan role sendiri melalui request frontend.
- Checkout harus menggunakan fungsi transaksional database atau backend tepercaya.

## 3. Alur checkout target
1. Kasir membuat keranjang di frontend.
2. Frontend mengirim daftar product ID, kuantitas, metode pembayaran, dan idempotency key.
3. Fungsi checkout memvalidasi identitas dan izin.
4. Fungsi mengambil harga dan stok terbaru dari database.
5. Fungsi menolak produk nonaktif, kuantitas tidak valid, atau stok tidak cukup.
6. Fungsi membuat transaksi dan item transaksi, lalu mengurangi stok dalam satu transaksi database.
7. Jika ada error, perubahan di-rollback.
8. Frontend menampilkan hasil hanya setelah respons sukses diterima.

Frontend boleh menampilkan estimasi total, tetapi total final ditentukan oleh sistem tepercaya.

## 4. Git dan deployment
- `main`: branch stabil untuk deployment produksi.
- `feature/*`: branch pengembangan fitur.
- Gunakan pull request/review sebelum merge.
- Gunakan Vercel Preview Deployment untuk memeriksa perubahan sebelum rilis.
- Pisahkan konfigurasi environment preview dan production.
- Jangan jalankan migrasi destruktif pada database produksi tanpa backup, review, dan rencana rollback.

## 5. Observabilitas dan pemulihan
Rencanakan pencatatan error checkout tanpa rahasia, audit trail untuk penyesuaian stok/pembatalan, backup dan uji pemulihan, pemantauan kuota layanan, serta prosedur saat internet/database tidak tersedia.

## 6. Hal yang harus diaudit
- Routing dan pembagian halaman.
- Sumber data produk dan apakah masih statis.
- Penggunaan localStorage atau state untuk keranjang.
- Apakah backend Express benar-benar digunakan.
- Integrasi Google GenAI yang benar-benar aktif.
- Skrip build dan konfigurasi Vercel.
- Nama environment variables (jangan menyalin nilai secret).
- Struktur CSS/component agar admin konsisten dengan UI sekarang.
