# Seruput & Kunyah — Product Requirements Document

- **Versi:** 0.1 (draft)
- **Status:** Perencanaan
- **Repository:** https://github.com/Najiann/seruputKunyah-web
- **Hosting frontend:** Vercel
- **Frontend:** React, TypeScript, Vite
- **Rencana data/auth:** Supabase PostgreSQL + Auth

## 1. Ringkasan
Seruput & Kunyah akan dikembangkan dari website publik menjadi sistem operasional penjualan. Website yang sudah ada dipertahankan, lalu ditambah admin dashboard, pengelolaan produk dan stok, Point of Sale (POS), riwayat transaksi, dan laporan penjualan.

Tujuan:
1. Mendukung operasional penjualan dengan data produk, stok, dan transaksi yang konsisten.
2. Menjadi project pembelajaran dan portofolio full-stack yang dapat dipahami serta dijelaskan oleh pengembang.

Dokumen ini adalah rancangan awal. Implementasi yang sudah ada harus diaudit sebelum kode diubah.

## 2. Tujuan dan indikator keberhasilan
- Admin dapat mengelola produk dan harga.
- Stok konsisten dengan transaksi berhasil dan penyesuaian yang sah.
- Kasir dapat mencatat penjualan melalui POS.
- Riwayat transaksi tersimpan dan dapat diperiksa kembali.
- Laporan menampilkan data transaksi aktual.
- Akses admin dibatasi dengan autentikasi dan otorisasi.
- Website live tetap aman selama pengembangan.

## 3. Pengguna
### Pelanggan
Menggunakan halaman publik dan fitur pelanggan yang memang tersedia.

### Admin
Mengelola produk, harga, kategori, stok, transaksi, dan laporan.

### Kasir
Menggunakan POS, memilih produk, mengelola keranjang, mencatat metode pembayaran, dan melihat transaksi sesuai izin.

Untuk MVP, admin boleh sekaligus menjalankan fungsi kasir. Pemisahan role dapat ditambahkan setelah kebutuhan dikonfirmasi.

## 4. Ruang lingkup MVP
### Website publik
Pertahankan halaman dan perilaku yang sudah berjalan. Audit halaman, routing, dan sumber data sebelum mengubahnya.

### Dashboard admin
- Login dan logout.
- Ringkasan penjualan berdasarkan periode.
- Ringkasan produk dan stok.
- Navigasi ke produk, POS, transaksi, dan laporan.

### Manajemen produk
- Lihat, tambah, dan edit produk.
- Data awal: nama, deskripsi, harga, kategori, gambar, status aktif, dan stok.
- Produk dapat dinonaktifkan tanpa menghapus riwayat transaksi.

### POS
- Cari dan pilih produk.
- Tambah produk ke keranjang.
- Ubah kuantitas atau hapus item.
- Hitung subtotal dan total.
- Pilih metode pembayaran yang didukung.
- Checkout dan simpan transaksi.
- Tampilkan konfirmasi dan nomor transaksi.

### Riwayat transaksi
Daftar transaksi dan detail item, kuantitas, harga saat transaksi, total, waktu, metode pembayaran, dan status.

### Laporan
- Filter tanggal/periode.
- Ringkasan jumlah transaksi dan omzet.
- Daftar produk terjual.
- Data laporan berasal dari transaksi tersimpan, bukan data statis.

## 5. Asumsi awal dan keputusan yang perlu dikonfirmasi
Untuk rancangan awal, MVP sementara menganggap stok dihitung sebagai **produk jadi** (misalnya jumlah gelas minuman atau porsi makanan siap jual), bukan bahan baku. Ini masih asumsi dan harus dikonfirmasi sebelum schema database difinalisasi.

Pertanyaan terbuka:
- Apakah pelanggan juga dapat memesan lewat website atau POS hanya untuk penjualan langsung?
- Metode pembayaran awal: tunai, QRIS manual, atau lainnya?
- Apakah produk memiliki ukuran, topping, atau varian?
- Apakah perlu stok bahan baku dan resep produk?
- Apakah admin dan kasir akun berbeda?
- Apakah perlu cetak struk?
- Bagaimana aturan pembatalan dan pengembalian transaksi?

## 6. Aturan bisnis
### Produk dan harga
- Harga harus valid dan tidak negatif.
- Produk nonaktif tidak dapat dijual dalam transaksi baru.
- Detail transaksi menyimpan snapshot nama produk dan harga saat checkout agar riwayat lama tidak berubah saat produk diedit.

### Stok
- Stok tidak boleh negatif.
- Stok berubah melalui transaksi berhasil atau penyesuaian stok berizin.
- Penyesuaian stok mencatat jumlah, alasan, waktu, dan pengguna.
- Transaksi historis tidak berubah ketika data produk diperbarui.

### Checkout
- Harga, total, dan stok divalidasi di backend/database.
- Total dihitung dari harga tepercaya; jangan percaya total kiriman frontend.
- Penyimpanan transaksi, detail item, dan pengurangan stok dilakukan secara atomik.
- Jika salah satu bagian gagal, semua perubahan checkout dibatalkan.
- Checkout berulang tidak boleh membuat transaksi ganda; gunakan idempotency key atau mekanisme setara.
- Stok tidak dikurangi bila checkout gagal.

### Pembayaran dan pembatalan
- Metode dan status pembayaran dicatat.
- Integrasi payment gateway otomatis tidak termasuk MVP awal.
- Status transaksi dan status pembayaran dibedakan bila diperlukan.
- Pembatalan/refund harus punya izin, jejak audit, dan aturan pengembalian stok yang jelas.

## 7. Kebutuhan nonfungsional
- Tampilan admin/POS responsif.
- Form memiliki validasi dan pesan error yang jelas.
- Akses data dilindungi autentikasi, otorisasi, dan RLS bila menggunakan Supabase.
- Secret key dan kredensial database tidak boleh disimpan di frontend.
- Transaksi dan detail transaksi memiliki relasi serta constraint yang sesuai.
- Nominal uang memakai representasi numerik yang aman, bukan floating point.
- Backup dan prosedur pemulihan disiapkan sebelum penggunaan operasional penuh.

## 8. Kriteria penerimaan
- Admin dapat login/logout.
- Pengguna tanpa izin tidak dapat menjalankan operasi admin.
- Produk dapat dibuat, dibaca, diperbarui, dan dinonaktifkan.
- Checkout memakai harga yang divalidasi di backend/database.
- Checkout sukses menyimpan transaksi dan mengurangi stok dengan benar.
- Checkout dengan stok tidak cukup ditolak.
- Checkout bersamaan tidak menyebabkan stok negatif.
- Checkout berulang tidak menggandakan transaksi.
- Harga historis tetap sesuai saat transaksi terjadi.
- Laporan cocok dengan transaksi yang memenuhi status penjualan.
- Website publik tetap berfungsi setelah rilis.
- Tidak ada secret key yang terekspos di frontend.

## 9. Di luar MVP
- Payment gateway otomatis.
- Multi-cabang dan transfer stok.
- Program loyalitas/poin.
- Pengadaan supplier dan akuntansi penuh.
- Aplikasi mobile terpisah.
- POS offline dengan sinkronisasi otomatis.
- Manajemen bahan baku dan resep (kecuali dikonfirmasi sebagai kebutuhan awal).

## 10. Tahapan
1. Audit repository dan dokumentasi.
2. Finalisasi kebutuhan dan desain database.
3. Setup Supabase, schema, migrasi, RLS, dan data uji.
4. Autentikasi dan manajemen produk.
5. POS dan checkout atomik.
6. Riwayat transaksi dan laporan.
7. Pengujian, deployment preview, dan rilis terkontrol.

## 11. Prinsip pengembangan
- Jangan mengubah `main` langsung selama pengembangan fitur.
- Gunakan branch fitur dan preview deployment.
- Audit kode sebelum menambah dependency atau mengganti arsitektur.
- Gunakan data uji selama pengembangan.
- Jangan menyatakan fitur siap produksi sebelum pengujian dan pemeriksaan keamanan selesai.
- Catat alasan keputusan teknis untuk kebutuhan portofolio.
