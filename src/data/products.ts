import { Product, BundleItem } from '../types';

/**
 * Single source of truth for SERUPUT & KUNYAH products.
 * Prices and descriptions are organized here for straightforward updating.
 * Note: Prices can be adjusted easily by the student team.
 */
export const PRODUCTS: Product[] = [
  {
    id: 'makaroni-basah',
    name: 'Makaroni Basah',
    category: 'food',
    categoryLabel: 'Makanan',
    description: 'Makaroni kenyal hangat berbalut bumbu gurih khas dan rempah cabai pilihan. Cocok dinikmati saat rehat santai.',
    price: 8000,
    image: '/images/makaroni-basah.jpg',
    badge: 'Favorit',
    spicyOptions: ['Pedas Santai (Level 1)', 'Pedas Sedang (Level 2)', 'Pedas Nendang (Level 3)', 'Gurih Original (Tidak Pedas)'],
    isCustomizable: true,
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
    spicyOptions: ['Pedas Santai (Level 1)', 'Pedas Sedang (Level 2)', 'Pedas Nendang (Level 3)', 'Gurih Original (Tidak Pedas)'],
    isCustomizable: true,
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
  },
];

/**
 * Bundles / Paket Rekomendasi
 * Configurable flag BUNDLES_ENABLED allows easily enabling or disabling this section.
 */
export const BUNDLES_ENABLED = true;

export const BUNDLE_ITEMS: BundleItem[] = [
  {
    id: 'paket-kombo-santai',
    name: 'Paket Kombo Santai',
    tagline: 'Makaroni Pilihan + Es Teh Manis',
    description: 'Paduan pas makaroni gurih (bebas pilih basah/kering) ditemani segarnya es teh manis dingin.',
    originalPrice: 12000,
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
    originalPrice: 14000,
    bundlePrice: 13000,
    productsIncluded: ['Makaroni (Basah/Kering)', 'Es Teh Lemon'],
    image: '/images/hero.jpg',
    badge: 'Hemat Rp1.000',
  },
];
