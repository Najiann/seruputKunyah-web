# 📘 Panduan Belajar React & TypeScript untuk Developer Laravel
### Proyek: Website & Katalog SERUPUT & KUNYAH ("Seruput Segar, Kunyah Lezat")

Dokumen ini disusun khusus untuk kamu yang sudah terbiasa dengan **Laravel (PHP)** dan sedang bertransisi atau mempelajari **React + TypeScript (Modern JavaScript)**.

---

## 🧭 1. Peta Analogi: Laravel vs React + TypeScript

Biar otakmu tidak kaget dengan istilah-istilah baru, berikut jembatan analogi langsung antara apa yang biasa kamu buat di Laravel dengan padanannya di React:

| Konsep di Laravel | Konsep di React + TypeScript | Penjelasan Sederhana |
| :--- | :--- | :--- |
| **Blade View / Component** (`<x-button />`) | **React Component** (`<ProductCard />`) | Potongan tampilan antarmuka yang modular dan bisa dipakai berulang kali. |
| **Blade Directives** (`@if`, `@foreach`) | **JSX Expressions** (`{condition && <Div />}`, `{items.map()}`) | Menampilkan HTML kondisional atau perulangan data langsung di dalam kode. |
| **PHP 8 Type Hinting** (`string $name, int $price`) | **TypeScript `interface`** (`interface Product { name: string; price: number; }`) | Kontrak tipe data agar editor memberi tahu error sebelum program dijalankan. |
| **Controller Request** (`$request->all()`) | **Component State** (`useState()`) | Tempat menyimpan nilai inputan form sementara di memori browser. |
| **Session / Shopping Cart** (`session('cart')`) | **Context API** (`CartContext`) | Tempat menyimpan data keranjang belanja yang bisa dibaca oleh semua halaman tanpa reload. |
| **Database Table / Seeder** | **File Data** (`src/data/products.ts`) | Sumber data resmi (*Single Source of Truth*). |
| **Helper Function** (`app/Helpers/...`) | **Utility File** (`src/utils/...`) | Fungsi umum seperti format Rupiah dan pembuat link WhatsApp. |

---

## 📖 2. Kamus Istilah Wajib (Frontend Dictionary)

1. **Component (Komponen)**  
   Sebuah fungsi JavaScript yang mengembalikan kode tampilan (JSX). Di proyek ini, contohnya `ProductCard.tsx`, `Navbar.tsx`, dan `ReviewModal.tsx`.
2. **JSX / TSX**  
   Sintaks ajaib yang memungkinkan kamu menulis kode mirip HTML langsung di dalam file JavaScript/TypeScript. (TSX = JSX yang dilengkapi fitur tipe data TypeScript).
3. **State (`useState`)**  
   "Memori lokal" sebuah komponen. Kalau datanya berubah, React akan otomatis menggambar ulang (*re-render*) bagian layar yang terpengaruh tanpa perlu me-reload seluruh halaman.
4. **Props (Properties)**  
   Data yang dikirim dari komponen induk (parent) ke komponen anak (child). Persis seperti kamu mengirim parameter ke fungsi atau Blade Component: `<ProductCard product={item} />`.
5. **Reaktivitas (Reactivity)**  
   Kemampuan halaman web untuk langsung merespons aksi pengguna secara instan (misal: klik tombol tambah keranjang ➔ angka di badge keranjang langsung naik detik itu juga).
6. **Single Source of Truth (SSOT)**  
   Prinsip di mana sebuah data hanya disimpan di **satu tempat resmi**. Misalnya daftar menu hanya ada di `src/data/products.ts`, sehingga bagian lain (katalog, keranjang, modal review) hanya mengambil dari situ.

---

## 🗂️ 3. Peta Struktur File Proyek SERUPUT & KUNYAH

Berikut panduan membaca struktur folder proyek ini:

```text
├── index.html                  <-- Pintu gerbang HTML (favicon, meta SEO, judul tab)
├── src/
│   ├── types.ts                <-- [BACA KE-1] Model & Struktur Data (Ibarat Migration schema di Laravel)
│   ├── config/
│   │   └── storeConfig.ts      <-- Pengaturan toko (nomor WhatsApp, Instagram, area kampus)
│   ├── data/
│   │   ├── products.ts         <-- [BACA KE-2] Master Data Menu (Ibarat Seeder/Tabel Produk)
│   │   └── reviews.ts          <-- Master Data Ulasan Pelanggan + Penyimpanan LocalStorage
│   ├── utils/
│   │   ├── currency.ts         <-- Helper format Rupiah (Rp8.000)
│   │   └── whatsapp.ts         <-- Helper pembangun link order WhatsApp Click to Chat
│   ├── context/
│   │   └── CartContext.tsx     <-- [BACA KE-4] State Manager Keranjang Belanja (Ibarat Session Keranjang)
│   ├── components/
│   │   ├── Navbar.tsx          <-- Navigasi atas (Logo, Menu, Keranjang)
│   │   ├── HeroSection.tsx     <-- Bagian pembuka ("Teman Ngemil, Teman Seruput!")
│   │   ├── ProductCard.tsx     <-- [BACA KE-3] Kartu satuan produk
│   │   ├── ProductSection.tsx  <-- Katalog menu dengan filter kategori
│   │   ├── BundleSection.tsx   <-- Paket hemat kombo makaroni + es teh
│   │   ├── CartDrawer.tsx      <-- Laci keranjang geser kanan + tombol checkout WA
│   │   ├── ReviewSection.tsx   <-- Daftar ulasan, rating bintang, kritik & saran
│   │   ├── ReviewModal.tsx     <-- Formulir popup untuk menulis ulasan
│   │   ├── BrandStory.tsx      <-- Cerita usaha rintisan mahasiswa
│   │   ├── OrderSteps.tsx      <-- 4 langkah mudah pemesanan
│   │   ├── ContactSection.tsx  <-- Kartu kontak WhatsApp, Instagram, jam operasional
│   │   ├── Footer.tsx          <-- Bagian kaki halaman + shortcut rahasia pengembang
│   │   └── DevAdminModal.tsx   <-- Panel rahasia pengembang (Shift + A)
│   ├── App.tsx                 <-- [BACA KE-5] File utama yang merakit semua komponen menjadi satu halaman
│   └── main.tsx                <-- Entry point JavaScript yang menancapkan React ke index.html
```

---

## 🎓 4. Alur Belajar yang Disarankan (Mulai dari Mana?)

Biar belajarmu runut dan tidak bingung, ikuti urutan membaca file ini:

### Langkah 1: Baca `src/types.ts`
Lihat bagaimana data produk (`Product`), keranjang (`CartItem`), dan ulasan (`CustomerReview`) didefinisikan.
*Kenapa?* Karena sebelum menulis kode apa pun, kamu harus tahu bentuk datanya terlebih dahulu.

### Langkah 2: Baca `src/data/products.ts`
Perhatikan bagaimana array `PRODUCTS` dibuat menggunakan tipe `Product[]`. Di sinilah data menu makaroni dan es teh berada.

### Langkah 3: Baca `src/components/ReviewModal.tsx`
Perhatikan kode yang baru saja kita perbaiki:
```ts
// Mengambil nama menu langsung dari products.ts
const menuOptions = [
  ...PRODUCTS.map(p => p.name),
  ...(BUNDLES_ENABLED ? BUNDLE_ITEMS.map(b => b.name) : []),
];
```
Pahami bagaimana `useState` digunakan untuk menampung bintang, nama, dan pilihan menu.

### Langkah 4: Baca `src/context/CartContext.tsx`
Pahami bagaimana fungsi `addToCart`, `updateQuantity`, dan `removeFromCart` bekerja dan disimpan ke `localStorage`.

### Langkah 5: Baca `src/App.tsx`
Lihat bagaimana komponen-komponen disusun dari atas ke bawah seperti menyusun lego.

---

## 🚀 5. Roadmap Masa Depan: Cara Menghubungkan ke PostgreSQL & POS

Sesuai rencana kerenmu tadi untuk membuat **Point of Sale (POS) & Dashboard Admin** dengan **PostgreSQL**:

1. **Hari Ini (Frontend Mandiri)**:
   Komponen membaca data dari file statis:
   ```ts
   import { PRODUCTS } from './data/products';
   ```

2. **Nanti (Saat Backend PostgreSQL Siap)**:
   Kamu cukup membuat API di backend (bisa pakai Laravel API / Node.js Express):
   ```text
   GET /api/products  --> Mengambil data dari tabel 'products' PostgreSQL
   POST /api/orders   --> Menyimpan pesanan kasir/online ke tabel 'orders'
   ```
   Lalu di frontend, kamu cukup mengganti sumber datanya:
   ```ts
   // Cukup ambil via fetch API
   const response = await fetch('/api/products');
   const products = await response.json();
   ```

Karena komponen UI sudah bersih dan modular, **kamu tidak perlu mendesain ulang antarmuka website dari awal**. Tampilan yang sudah kita bangun ini 100% siap untuk masa depan bisnismu!
