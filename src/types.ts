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
  isActive?: boolean;
  stock?: number;
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
  isActive?: boolean;
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
  storeAddress: string; // e.g. "Jl. Mujair 1 No. 22, Pasar Minggu"
  gmapsQuery: string; // search query or "lat, lng" for Google Maps pin
  gmapsUrl?: string; // optional direct Google Maps share URL
  operationalHours: string; // e.g. "Senin – Sabtu, 10.00 – 20.00 WIB"
  brandTagline: string;
}

export interface CustomerReview {
  id: string;
  name: string;
  roleOrAffiliation?: string; // e.g. "Mahasiswa FEB", "Anak Kosan", "Pelanggan Setia"
  rating: number; // 1 to 5
  menuBought: string; // e.g. "Makaroni Basah", "Makaroni Kering", "Es Teh Lemon", etc.
  comment: string; // Ulasan rasa & pengalaman
  suggestion?: string; // Kritik & saran
  date: string; // e.g. "12 Okt 2026"
  isVerified?: boolean;
}

// ============================================================================
// BACKEND / SUPABASE ENTITIES (Admin, POS, Inventory, Transactions, Reports)
// ============================================================================

export type UserRole = 'admin' | 'cashier';

export interface Profile {
  id: string;
  display_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface AdminProduct {
  id: string;
  category_id: string | null;
  category_name: string;
  category_slug: string;
  name: string;
  description: string;
  price: number; // integer Rupiah >= 0
  image_url: string;
  is_active: boolean;
  quantity_on_hand: number; // from inventory table (>= 0)
  created_at: string;
  updated_at: string;
}

export interface InventoryRecord {
  product_id: string;
  quantity_on_hand: number;
  updated_at: string;
}

export type MovementType = 'sale' | 'adjustment' | 'return';

export interface StockMovement {
  id: string;
  product_id: string;
  product_name?: string;
  movement_type: MovementType;
  quantity_delta: number;
  reason: string;
  reference_transaction_id: string | null;
  reference_transaction_number?: string | null;
  created_by: string | null;
  created_by_name?: string;
  created_at: string;
}

export type TransactionStatus = 'completed' | 'cancelled' | 'refunded';
export type PaymentMethod = 'cash' | 'qris' | 'transfer';
export type PaymentStatus = 'paid' | 'pending' | 'refunded';

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  product_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
}

export interface TransactionRecord {
  id: string;
  transaction_number: string;
  created_by: string | null;
  created_by_name?: string;
  status: TransactionStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  discount_total: number;
  grand_total: number;
  idempotency_key: string;
  created_at: string;
  items: TransactionItem[];
}

export interface PosCheckoutItemInput {
  product_id: string;
  quantity: number;
}

export interface PosCheckoutInput {
  items: PosCheckoutItemInput[];
  payment_method: PaymentMethod;
  payment_status: 'paid' | 'pending';
  discount_total: number;
  idempotency_key: string;
}
