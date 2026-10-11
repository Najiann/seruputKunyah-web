export type ProductCategory = 'all' | 'food' | 'drink';

export interface Product {
  id: string;
  name: string;
  category: 'food' | 'drink';
  categoryLabel: string;
  description: string;
  price: number;
  image: string;
  badge?: string;
  spicyOptions?: string[];
  isCustomizable?: boolean;
}

export interface BundleItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  originalPrice: number;
  bundlePrice: number;
  productsIncluded: string[];
  image: string;
  badge: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface StoreConfig {
  whatsappNumber: string; // international format e.g. "6281234567890" (configurable)
  whatsappDisplay: string; // e.g. "+62 812-3456-7890"
  instagramHandle: string; // e.g. "@seruputkunyah"
  instagramUrl: string;
  campusArea: string; // e.g. "Area Kampus & Sekitarnya"
  operationalHours: string; // e.g. "Senin – Sabtu, 10.00 – 20.00 WIB"
  brandTagline: string;
}
