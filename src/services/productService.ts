import { Product, BundleItem, ProductCategory } from '../types';

/**
 * ============================================================================
 * SINGLE SOURCE OF TRUTH (SSOT) — MODUL PRODUK & HARGA TERPUSAT
 * ============================================================================
 * Modul ini adalah satu-satunya sumber data resmi untuk nama, harga, varian,
 * dan status produk SERUPUT & KUNYAH.
 *
 * Seluruh komponen (Katalog, Hero, Keranjang, POS Kasir, Checkout WhatsApp,
 * Paket Bundling, Form Ulasan, Admin) HANYA mengambil data dari modul ini.
 * Jika harga atau nama produk diubah di sini (atau via Admin), SELURUH FITUR
 * akan otomatis tersinkronisasi tanpa perlu merombak file lain.
 */

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'makaroni-basah',
    name: 'Makaroni Basah',
    category: 'food',
    categoryLabel: 'Makanan',
    description: 'Makaroni kenyal hangat berbalut bumbu gurih khas dan rempah cabai pilihan. Cocok dinikmati saat rehat santai.',
    price: 8000,
    image: '/images/makaroni-basah.jpg',
    badge: 'Favorit',
    spicyOptions: [
      'Pedas Santai (Level 1)',
      'Pedas Sedang (Level 2)',
      'Pedas Nendang (Level 3)',
      'Gurih Original (Tidak Pedas)',
    ],
    isCustomizable: true,
    isActive: true,
    stock: 50,
  },
  {
    id: 'makaroni-kering',
    name: 'Makaroni Kering',
    category: 'food',
    categoryLabel: 'Makanan',
    description: 'Makaroni goreng renyah kriuk dengan taburan bumbu asin pedas gurih. Camilan wajib teman nugas dan ngobrol.',
    price: 8000,
    image: '/images/makaroni-kering.jpg',
    badge: 'Kriuk Gurih',
    spicyOptions: [
      'Pedas Santai (Level 1)',
      'Pedas Sedang (Level 2)',
      'Pedas Nendang (Level 3)',
      'Gurih Original (Tidak Pedas)',
    ],
    isCustomizable: true,
    isActive: true,
    stock: 50,
  },
  {
    id: 'es-teh',
    name: 'Es Teh Manis',
    category: 'drink',
    categoryLabel: 'Minuman',
    description: 'Seduhan teh melati wangi dengan rasa manis pas dan dingin menyegarkan. Penghilang dahaga paling pas sehabis nyemil.',
    price: 4000,
    image: '/images/es-teh.jpg',
    badge: 'Segar Pas',
    spicyOptions: ['Manis Normal', 'Sedikit Manis (Less Sugar)'],
    isCustomizable: true,
    isActive: true,
    stock: 100,
  },
  {
    id: 'es-teh-lemon',
    name: 'Es Teh Lemon',
    category: 'drink',
    categoryLabel: 'Minuman',
    description: 'Kombinasi teh aromatik dingin dengan perasan dan irisan lemon segar. Sensasi asam manis yang langsung melegakan.',
    price: 6000,
    image: '/images/es-teh-lemon.jpg',
    badge: 'Ekstra Segar',
    spicyOptions: ['Manis Normal', 'Sedikit Manis (Less Sugar)'],
    isCustomizable: true,
    isActive: true,
    stock: 60,
  },
];

export const INITIAL_BUNDLES: BundleItem[] = [
  {
    id: 'paket-kombo-santai',
    name: 'Paket Kombo Santai',
    tagline: 'Makaroni Pilihan + Es Teh Manis',
    description: 'Paduan pas makaroni gurih (bebas pilih basah/kering) ditemani segarnya es teh manis dingin.',
    originalPrice: 12000, // Dihitung otomatis: Makaroni (8000) + Es Teh (4000)
    bundlePrice: 11000,
    productsIncluded: ['Makaroni (Basah/Kering)', 'Es Teh Manis'],
    image: '/images/hero.jpg',
    badge: 'Hemat Rp1.000',
  },
  {
    id: 'paket-kombo-segar',
    name: 'Paket Kombo Segar Lemon',
    tagline: 'Makaroni Pilihan + Es Teh Lemon',
    description: 'Kombinasi makaroni pedas gurih dengan sensasi asam-manis segar dari es teh lemon dingin.',
    originalPrice: 14000, // Dihitung otomatis: Makaroni (8000) + Lemon (6000)
    bundlePrice: 13000,
    productsIncluded: ['Makaroni (Basah/Kering)', 'Es Teh Lemon'],
    image: '/images/hero.jpg',
    badge: 'Hemat Rp1.000',
  },
];

const PRODUCTS_STORAGE_KEY = 'seruput_kunyah_products_v2';
const BUNDLES_STORAGE_KEY = 'seruput_kunyah_bundles_v2';

/**
 * Mengambil master produk aktif dari penyimpanan lokal (atau default).
 */
export function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Gagal memuat produk dari localStorage, menggunakan data default', err);
  }
  return INITIAL_PRODUCTS;
}

/**
 * Menyimpan master produk ke localStorage.
 */
export function saveStoredProducts(products: Product[]): Product[] {
  try {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    // Trigger window storage event for cross-tab or component sync
    window.dispatchEvent(new Event('seruput-products-changed'));
  } catch (err) {
    console.warn('Gagal menyimpan produk ke localStorage', err);
  }
  return products;
}

/**
 * Mengambil harga terendah dari seluruh produk yang aktif.
 * Digunakan secara dinamis oleh Hero Section ("Mulai Rp4.000").
 */
export function calculateLowestPrice(products: Product[] = getStoredProducts()): number {
  const activeProducts = products.filter(p => p.isActive !== false);
  if (activeProducts.length === 0) return 4000;
  return Math.min(...activeProducts.map(p => p.price));
}

/**
 * Mengkalkulasi ulang harga paket bundling secara otomatis
 * berdasarkan harga satuan produk yang terkandung di dalamnya.
 * Diskon standar paket adalah Rp1.000.
 */
export function calculateBundles(products: Product[] = getStoredProducts()): BundleItem[] {
  const makaroni = products.find(p => p.id === 'makaroni-basah') || products.find(p => p.category === 'food');
  const esTeh = products.find(p => p.id === 'es-teh');
  const esTehLemon = products.find(p => p.id === 'es-teh-lemon');

  const makaroniPrice = makaroni ? makaroni.price : 8000;
  const esTehPrice = esTeh ? esTeh.price : 4000;
  const lemonPrice = esTehLemon ? esTehLemon.price : 6000;

  const bundleDiscount = 1000;

  return [
    {
      id: 'paket-kombo-santai',
      name: 'Paket Kombo Santai',
      tagline: 'Makaroni Pilihan + Es Teh Manis',
      description: 'Paduan pas makaroni gurih (bebas pilih basah/kering) ditemani segarnya es teh manis dingin.',
      originalPrice: makaroniPrice + esTehPrice,
      bundlePrice: Math.max(0, makaroniPrice + esTehPrice - bundleDiscount),
      productsIncluded: ['Makaroni (Basah/Kering)', 'Es Teh Manis'],
      image: '/images/hero.jpg',
      badge: `Hemat Rp${bundleDiscount.toLocaleString('id-ID')}`,
    },
    {
      id: 'paket-kombo-segar',
      name: 'Paket Kombo Segar Lemon',
      tagline: 'Makaroni Pilihan + Es Teh Lemon',
      description: 'Kombinasi makaroni pedas gurih dengan sensasi asam-manis segar dari es teh lemon dingin.',
      originalPrice: makaroniPrice + lemonPrice,
      bundlePrice: Math.max(0, makaroniPrice + lemonPrice - bundleDiscount),
      productsIncluded: ['Makaroni (Basah/Kering)', 'Es Teh Lemon'],
      image: '/images/hero.jpg',
      badge: `Hemat Rp${bundleDiscount.toLocaleString('id-ID')}`,
    },
  ];
}

/**
 * Mengambil opsi nama menu lengkap untuk dropdown ulasan / pencarian POS.
 */
export function getAllMenuNames(products: Product[] = getStoredProducts()): string[] {
  const bundles = calculateBundles(products);
  return [
    ...products.filter(p => p.isActive !== false).map(p => p.name),
    ...bundles.map(b => b.name),
  ];
}
