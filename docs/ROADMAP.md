# Roadmap — Seruput & Kunyah

## Tahap 0 — Audit dan keselamatan
- [ ] Periksa `git status`, branch, dan remote.
- [ ] Pastikan perubahan lokal penting tersimpan.
- [ ] Buat branch fitur dari kondisi `main` yang diketahui.
- [ ] Catat halaman dan fungsi website yang sudah berjalan.
- [ ] Periksa `package.json`, scripts, routing, data produk, dan nama environment variables.
- [ ] Verifikasi deployment production tetap sehat.

**Selesai jika:** baseline terdokumentasi dan branch kerja tersedia.

## Tahap 1 — Finalisasi kebutuhan
- [ ] Konfirmasi alur penjualan (website, kasir, atau keduanya).
- [ ] Konfirmasi stok produk jadi vs bahan baku.
- [ ] Konfirmasi metode dan status pembayaran.
- [ ] Konfirmasi varian, diskon, struk, pembatalan, dan refund.
- [ ] Perbarui PRD dan arsitektur.

**Selesai jika:** keputusan yang memengaruhi schema sudah disepakati.

## Tahap 2 — Database dan keamanan
- [ ] Buat proyek Supabase development.
- [ ] Rancang schema dan migration.
- [ ] Buat seed data uji.
- [ ] Konfigurasi Auth dan RLS.
- [ ] Uji akses sebagai anonymous, admin, dan kasir.
- [ ] Buat fungsi checkout atomik.

**Selesai jika:** data dan akses teruji tanpa menyentuh data produksi.

## Tahap 3 — Produk dan admin
- [ ] Tambahkan route/layout admin.
- [ ] Implementasikan login/logout.
- [ ] Implementasikan CRUD produk.
- [ ] Implementasikan penyesuaian stok dan audit trail.
- [ ] Tambahkan loading/error/empty states.

**Selesai jika:** admin dapat mengelola produk dengan aman.

## Tahap 4 — POS
- [ ] Katalog produk POS.
- [ ] Pencarian dan keranjang.
- [ ] Kuantitas dan validasi stok.
- [ ] Metode pembayaran.
- [ ] Checkout transaksional.
- [ ] Konfirmasi dan nomor transaksi.
- [ ] Uji stok tidak cukup, request gagal, dan checkout berulang.

**Selesai jika:** transaksi valid tersimpan sekali dan stok konsisten.

## Tahap 5 — Riwayat dan laporan
- [ ] Daftar dan detail transaksi.
- [ ] Filter tanggal.
- [ ] Ringkasan penjualan.
- [ ] Rekonsiliasi laporan terhadap transaksi sumber.
- [ ] Ekspor laporan bila dibutuhkan.

**Selesai jika:** angka laporan dapat ditelusuri ke transaksi.

## Tahap 6 — Rilis
- [ ] Jalankan lint/typecheck/build yang tersedia.
- [ ] Jalankan test otomatis dan checklist manual.
- [ ] Review keamanan.
- [ ] Uji di Vercel Preview.
- [ ] Siapkan backup dan pemulihan database.
- [ ] Merge melalui review ke `main`.
- [ ] Verifikasi production setelah rilis.

**Selesai jika:** MVP lulus pengujian dan dirilis dengan rencana pemulihan.

## Aturan kerja
- Satu perubahan logis per commit.
- Jangan commit `.env` atau secret.
- Jangan gunakan transaksi bisnis sungguhan di environment pengembangan.
- Jangan mengubah schema production secara manual tanpa migration tercatat.
- Jika build gagal, perbaiki sebelum melanjutkan tahap berikutnya.
