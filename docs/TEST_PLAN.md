# Test Plan — Seruput & Kunyah

- **Status:** Draft
- **Tujuan:** memverifikasi perilaku produk, POS, keamanan, dan deployment sebelum rilis.

## 1. Website dan regresi
- [ ] Halaman publik utama terbuka.
- [ ] Navigasi dan tautan bekerja.
- [ ] Gambar/aset termuat.
- [ ] Layout desktop dan mobile dapat digunakan.
- [ ] Fitur publik yang ada tetap berfungsi setelah perubahan.
- [ ] Refresh langsung pada route yang didukung tidak menghasilkan 404.

## 2. Autentikasi dan otorisasi
- [ ] Admin dapat login dengan kredensial valid.
- [ ] Login dengan kredensial salah ditolak.
- [ ] Logout mengakhiri sesi aplikasi.
- [ ] Pengunjung tanpa sesi tidak dapat mengakses route admin.
- [ ] Request langsung ke API/database tanpa izin ditolak.
- [ ] Pengguna tidak dapat mengubah role sendiri.

## 3. Manajemen produk
- [ ] Produk dapat dibuat dengan input valid.
- [ ] Nama wajib dan harga divalidasi.
- [ ] Harga negatif ditolak.
- [ ] Produk dapat diperbarui dan dinonaktifkan.
- [ ] Produk nonaktif tidak tersedia untuk checkout baru.
- [ ] Riwayat transaksi tetap benar setelah produk diedit.

## 4. Stok
- [ ] Penyesuaian stok berizin tercatat dengan alasan.
- [ ] Penyesuaian tanpa izin ditolak.
- [ ] Stok negatif ditolak.
- [ ] Transaksi gagal tidak mengurangi stok.
- [ ] Penjualan berhasil mengurangi stok sesuai kuantitas.
- [ ] Pergerakan stok dapat ditelusuri.

## 5. POS dan checkout
- [ ] Produk dapat ditambahkan ke keranjang.
- [ ] Kuantitas dapat diubah dan item dihapus.
- [ ] Kuantitas nol/negatif ditolak.
- [ ] Manipulasi harga/total dari browser tidak mengubah hasil server.
- [ ] Produk nonaktif ditolak saat checkout.
- [ ] Stok tidak cukup membuat checkout ditolak.
- [ ] Checkout valid membuat satu transaksi dan item-itemnya.
- [ ] Stok dikurangi hanya ketika checkout berhasil.
- [ ] Kegagalan tidak meninggalkan transaksi parsial.
- [ ] Request checkout berulang tidak menggandakan transaksi.
- [ ] Dua checkout bersamaan untuk stok terbatas tidak menyebabkan stok negatif.
- [ ] Status pembayaran tercatat dengan benar.

## 6. Riwayat dan laporan
- [ ] Detail transaksi sesuai item yang dijual.
- [ ] Harga snapshot tidak berubah saat harga produk diperbarui.
- [ ] Filter periode menangani batas tanggal dengan benar.
- [ ] Transaksi batal/refund mengikuti kebijakan yang disepakati.
- [ ] Omzet tidak menghitung transaksi yang tidak memenuhi definisi penjualan.
- [ ] Total laporan dapat direkonsiliasi terhadap transaksi sumber.

## 7. Deployment dan konfigurasi
- [ ] Build production berhasil.
- [ ] Environment variable tersedia di environment yang tepat.
- [ ] Tidak ada secret di source, bundle frontend, atau log.
- [ ] Preview deployment diuji sebelum merge ke `main`.
- [ ] Migrasi diuji pada database development terlebih dahulu.
- [ ] Prosedur backup dan pemulihan terdokumentasi.
- [ ] Website production diperiksa setelah rilis.

## 8. Bukti pengujian
Untuk setiap rilis, catat tanggal, commit/branch, environment, hasil pass/fail, langkah reproduksi, isu terbuka, dan keputusan rilis. Screenshot/log tidak boleh mengandung rahasia.
