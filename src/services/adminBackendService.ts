import { ensureSupabaseClient } from '../lib/supabase';
import {
  AdminProduct,
  Category,
  MovementType,
  PaymentMethod,
  PaymentStatus,
  PosCheckoutInput,
  Product,
  Profile,
  StockMovement,
  TransactionItem,
  TransactionRecord,
  TransactionStatus,
  UserRole,
} from '../types';
import { INITIAL_PRODUCTS, saveStoredProducts } from './productService';

// ============================================================================
// LOCAL SANDBOX STORAGE KEYS (Dipakai saat VITE_SUPABASE_* belum dikonfigurasi)
// ============================================================================
const LOCAL_KEYS = {
  categories: 'sk_db_categories_v1',
  products: 'sk_db_products_v1',
  inventory: 'sk_db_inventory_v1',
  stockMovements: 'sk_db_stock_movements_v1',
  transactions: 'sk_db_transactions_v1',
  transactionItems: 'sk_db_transaction_items_v1',
  sessionProfile: 'sk_db_local_profile_v1',
} as const;

interface RawLocalProduct {
  id: string;
  category_id: string | null;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface RawLocalInventory {
  product_id: string;
  quantity_on_hand: number;
  updated_at: string;
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureLocalSeed(): void {
  const existingCats = readJson<Category[]>(LOCAL_KEYS.categories, []);
  if (existingCats.length === 0) {
    const now = new Date().toISOString();
    const cats: Category[] = [
      { id: 'cat-food', name: 'Makanan', slug: 'food', created_at: now, updated_at: now },
      { id: 'cat-drink', name: 'Minuman', slug: 'drink', created_at: now, updated_at: now },
    ];
    writeJson(LOCAL_KEYS.categories, cats);
  }

  const existingProducts = readJson<RawLocalProduct[]>(LOCAL_KEYS.products, []);
  if (existingProducts.length === 0) {
    const now = new Date().toISOString();
    const seededProducts: RawLocalProduct[] = INITIAL_PRODUCTS.map((p) => ({
      id: p.id,
      category_id: p.category === 'drink' ? 'cat-drink' : 'cat-food',
      name: p.name,
      description: p.description,
      price: p.price,
      image_url: p.image,
      is_active: p.isActive !== false,
      created_at: now,
      updated_at: now,
    }));
    const seededInventory: RawLocalInventory[] = INITIAL_PRODUCTS.map((p) => ({
      product_id: p.id,
      quantity_on_hand: p.stock ?? 50,
      updated_at: now,
    }));
    writeJson(LOCAL_KEYS.products, seededProducts);
    writeJson(LOCAL_KEYS.inventory, seededInventory);
  }
}

function syncPublicCatalogFromLocal(): void {
  const categories = readJson<Category[]>(LOCAL_KEYS.categories, []);
  const products = readJson<RawLocalProduct[]>(LOCAL_KEYS.products, []);
  const inventory = readJson<RawLocalInventory[]>(LOCAL_KEYS.inventory, []);

  const catLookup: Record<string, Category> = {};
  categories.forEach((c) => {
    catLookup[c.id] = c;
  });

  const invLookup: Record<string, number> = {};
  inventory.forEach((i) => {
    invLookup[i.product_id] = i.quantity_on_hand;
  });

  const storefrontProducts: Product[] = products.map((p) => {
    const cat = p.category_id ? catLookup[p.category_id] : undefined;
    const isDrink = cat?.slug === 'drink';
    const baseSeed = INITIAL_PRODUCTS.find((ip) => ip.id === p.id);

    return {
      id: p.id,
      name: p.name,
      category: isDrink ? 'drink' : 'food',
      categoryLabel: cat?.name || (isDrink ? 'Minuman' : 'Makanan'),
      description: p.description,
      price: p.price,
      image: p.image_url || '/images/hero.jpg',
      badge: baseSeed?.badge,
      spicyOptions: baseSeed?.spicyOptions,
      isCustomizable: baseSeed?.isCustomizable ?? false,
      isActive: p.is_active,
      stock: invLookup[p.id] ?? 0,
    };
  });

  saveStoredProducts(storefrontProducts);
}

function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ============================================================================
// PUBLIC STOREFRONT FETCH (Reads active products from Supabase if configured)
// ============================================================================
export async function fetchPublicProductsIfSupabase(): Promise<Product[] | null> {
  const supabase = await ensureSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('products')
    .select('id, name, description, price, image_url, is_active, categories(id, name, slug)')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error || !data) return null;

  return data.map((row) => {
    const catObj = Array.isArray(row.categories) ? row.categories[0] : row.categories;
    const slug = (catObj as { slug?: string } | null)?.slug || 'food';
    const label = (catObj as { name?: string } | null)?.name || (slug === 'drink' ? 'Minuman' : 'Makanan');
    const baseSeed = INITIAL_PRODUCTS.find((ip) => ip.name.toLowerCase() === String(row.name).toLowerCase());

    return {
      id: String(row.id),
      name: String(row.name),
      category: slug === 'drink' ? 'drink' : 'food',
      categoryLabel: label,
      description: String(row.description || ''),
      price: Number(row.price) || 0,
      image: String(row.image_url || '/images/hero.jpg'),
      badge: baseSeed?.badge,
      spicyOptions: baseSeed?.spicyOptions,
      isCustomizable: baseSeed?.isCustomizable ?? false,
      isActive: Boolean(row.is_active),
    };
  });
}

// ============================================================================
// AUTHENTICATION & PROFILES
// ============================================================================
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await ensureSupabaseClient();
  if (supabase) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, display_name, role, created_at, updated_at')
      .eq('id', userData.user.id)
      .single();

    if (error || !profile) return null;
    return profile as Profile;
  }

  return readJson<Profile | null>(LOCAL_KEYS.sessionProfile, null);
}

export async function signInWithEmailPassword(email: string, password: string): Promise<Profile> {
  const supabase = await ensureSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase belum dikonfigurasi pada environment (.env).');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user) {
    throw new Error(error?.message || 'Email atau kata sandi salah.');
  }

  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('id, display_name, role, created_at, updated_at')
    .eq('id', data.user.id)
    .single();

  if (profileErr || !profile) {
    await supabase.auth.signOut();
    throw new Error('Akun tidak memiliki profil otorisasi pada tabel profiles.');
  }

  return profile as Profile;
}

export function signInLocalSandbox(displayName: string, role: UserRole): Profile {
  ensureLocalSeed();
  const now = new Date().toISOString();
  const profile: Profile = {
    id: role === 'admin' ? 'local-admin-001' : 'local-cashier-001',
    display_name: displayName.trim() || (role === 'admin' ? 'Admin Toko' : 'Kasir Booth'),
    role,
    created_at: now,
    updated_at: now,
  };
  writeJson(LOCAL_KEYS.sessionProfile, profile);
  return profile;
}

export async function signOutAdmin(): Promise<void> {
  const supabase = await ensureSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
    return;
  }
  localStorage.removeItem(LOCAL_KEYS.sessionProfile);
}

// ============================================================================
// CATEGORIES
// ============================================================================
export async function listCategories(): Promise<Category[]> {
  const supabase = await ensureSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, created_at, updated_at')
      .order('name', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []) as Category[];
  }

  ensureLocalSeed();
  return readJson<Category[]>(LOCAL_KEYS.categories, []);
}

export async function saveCategory(
  input: { id?: string; name: string; slug: string },
  actorRole: UserRole
): Promise<Category> {
  if (actorRole !== 'admin') {
    throw new Error('Akses ditolak: hanya admin yang dapat mengelola kategori.');
  }

  const name = input.name.trim();
  const slug = input.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/(^-|-$)/g, '');

  if (!name || !slug) {
    throw new Error('Nama dan slug kategori wajib diisi.');
  }

  const supabase = await ensureSupabaseClient();
  if (supabase) {
    if (input.id) {
      const { data, error } = await supabase
        .from('categories')
        .update({ name, slug, updated_at: new Date().toISOString() })
        .eq('id', input.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Category;
    } else {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name, slug })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Category;
    }
  }

  ensureLocalSeed();
  const categories = readJson<Category[]>(LOCAL_KEYS.categories, []);
  const duplicate = categories.find((c) => c.slug === slug && c.id !== input.id);
  if (duplicate) {
    throw new Error(`Slug "${slug}" sudah digunakan.`);
  }

  const now = new Date().toISOString();
  if (input.id) {
    const idx = categories.findIndex((c) => c.id === input.id);
    if (idx === -1) throw new Error('Kategori tidak ditemukan.');
    const updated: Category = { ...categories[idx], name, slug, updated_at: now };
    categories[idx] = updated;
    writeJson(LOCAL_KEYS.categories, categories);
    syncPublicCatalogFromLocal();
    return updated;
  }

  const created: Category = {
    id: generateId('cat'),
    name,
    slug,
    created_at: now,
    updated_at: now,
  };
  categories.push(created);
  writeJson(LOCAL_KEYS.categories, categories);
  return created;
}

// ============================================================================
// PRODUCTS + INVENTORY
// ============================================================================
export async function listAdminProducts(): Promise<AdminProduct[]> {
  const supabase = await ensureSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        category_id,
        name,
        description,
        price,
        image_url,
        is_active,
        created_at,
        updated_at,
        categories ( name, slug ),
        inventory ( quantity_on_hand )
      `)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);

    return (data || []).map((row) => {
      const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories;
      const inv = Array.isArray(row.inventory) ? row.inventory[0] : row.inventory;
      return {
        id: String(row.id),
        category_id: row.category_id ? String(row.category_id) : null,
        category_name: (cat as { name?: string } | null)?.name || 'Tanpa Kategori',
        category_slug: (cat as { slug?: string } | null)?.slug || 'other',
        name: String(row.name),
        description: String(row.description || ''),
        price: Number(row.price) || 0,
        image_url: String(row.image_url || ''),
        is_active: Boolean(row.is_active),
        quantity_on_hand: Number((inv as { quantity_on_hand?: number } | null)?.quantity_on_hand ?? 0),
        created_at: String(row.created_at),
        updated_at: String(row.updated_at),
      };
    });
  }

  ensureLocalSeed();
  const categories = readJson<Category[]>(LOCAL_KEYS.categories, []);
  const products = readJson<RawLocalProduct[]>(LOCAL_KEYS.products, []);
  const inventory = readJson<RawLocalInventory[]>(LOCAL_KEYS.inventory, []);

  const catMap: Record<string, Category> = {};
  categories.forEach((c) => {
    catMap[c.id] = c;
  });

  const invMap: Record<string, number> = {};
  inventory.forEach((i) => {
    invMap[i.product_id] = i.quantity_on_hand;
  });

  return products.map((p) => {
    const cat = p.category_id ? catMap[p.category_id] : undefined;
    return {
      id: p.id,
      category_id: p.category_id,
      category_name: cat?.name || 'Tanpa Kategori',
      category_slug: cat?.slug || 'other',
      name: p.name,
      description: p.description,
      price: p.price,
      image_url: p.image_url,
      is_active: p.is_active,
      quantity_on_hand: invMap[p.id] ?? 0,
      created_at: p.created_at,
      updated_at: p.updated_at,
    };
  });
}

export interface UpsertProductInput {
  id?: string;
  category_id: string | null;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_active: boolean;
  initial_stock?: number;
}

export async function saveAdminProduct(
  input: UpsertProductInput,
  actor: Profile
): Promise<AdminProduct> {
  if (actor.role !== 'admin') {
    throw new Error('Akses ditolak: hanya admin yang dapat menambah atau mengubah produk.');
  }

  const name = input.name.trim();
  const price = Math.round(Number(input.price));
  if (!name) throw new Error('Nama produk wajib diisi.');
  if (!Number.isFinite(price) || price < 0) {
    throw new Error('Harga produk tidak boleh negatif.');
  }

  const initialStock = Math.round(Number(input.initial_stock ?? 0));
  if (!input.id && (!Number.isFinite(initialStock) || initialStock < 0)) {
    throw new Error('Stok awal tidak boleh negatif.');
  }

  const supabase = await ensureSupabaseClient();
  if (supabase) {
    if (input.id) {
      const { error } = await supabase
        .from('products')
        .update({
          category_id: input.category_id || null,
          name,
          description: input.description.trim(),
          price,
          image_url: input.image_url.trim(),
          is_active: input.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id);
      if (error) throw new Error(error.message);

      const all = await listAdminProducts();
      const found = all.find((p) => p.id === input.id);
      if (!found) throw new Error('Gagal memuat ulang data produk.');
      return found;
    } else {
      const { data: created, error } = await supabase
        .from('products')
        .insert({
          category_id: input.category_id || null,
          name,
          description: input.description.trim(),
          price,
          image_url: input.image_url.trim(),
          is_active: input.is_active,
        })
        .select('id')
        .single();
      if (error || !created) throw new Error(error?.message || 'Gagal membuat produk.');

      if (initialStock > 0) {
        const { error: stockErr } = await supabase.rpc('adjust_inventory_stock', {
          p_product_id: created.id,
          p_quantity_delta: initialStock,
          p_movement_type: 'adjustment',
          p_reason: 'Stok awal produk baru',
        });
        if (stockErr) throw new Error(stockErr.message);
      }

      const all = await listAdminProducts();
      const found = all.find((p) => p.id === String(created.id));
      if (!found) throw new Error('Gagal memuat produk yang baru dibuat.');
      return found;
    }
  }

  ensureLocalSeed();
  const products = readJson<RawLocalProduct[]>(LOCAL_KEYS.products, []);
  const inventory = readJson<RawLocalInventory[]>(LOCAL_KEYS.inventory, []);
  const movements = readJson<StockMovement[]>(LOCAL_KEYS.stockMovements, []);
  const now = new Date().toISOString();

  if (input.id) {
    const idx = products.findIndex((p) => p.id === input.id);
    if (idx === -1) throw new Error('Produk tidak ditemukan.');
    products[idx] = {
      ...products[idx],
      category_id: input.category_id || null,
      name,
      description: input.description.trim(),
      price,
      image_url: input.image_url.trim(),
      is_active: input.is_active,
      updated_at: now,
    };
    writeJson(LOCAL_KEYS.products, products);
    syncPublicCatalogFromLocal();
    const list = await listAdminProducts();
    const updated = list.find((p) => p.id === input.id);
    if (!updated) throw new Error('Produk tidak ditemukan.');
    return updated;
  }

  const newId = generateId('prod');
  const createdProduct: RawLocalProduct = {
    id: newId,
    category_id: input.category_id || null,
    name,
    description: input.description.trim(),
    price,
    image_url: input.image_url.trim(),
    is_active: input.is_active,
    created_at: now,
    updated_at: now,
  };
  products.push(createdProduct);
  inventory.push({
    product_id: newId,
    quantity_on_hand: initialStock,
    updated_at: now,
  });
  if (initialStock > 0) {
    movements.unshift({
      id: generateId('mov'),
      product_id: newId,
      product_name: name,
      movement_type: 'adjustment',
      quantity_delta: initialStock,
      reason: 'Stok awal produk baru',
      reference_transaction_id: null,
      reference_transaction_number: null,
      created_by: actor.id,
      created_by_name: actor.display_name,
      created_at: now,
    });
  }

  writeJson(LOCAL_KEYS.products, products);
  writeJson(LOCAL_KEYS.inventory, inventory);
  writeJson(LOCAL_KEYS.stockMovements, movements);
  syncPublicCatalogFromLocal();

  const list = await listAdminProducts();
  const found = list.find((p) => p.id === newId);
  if (!found) throw new Error('Gagal membuat produk.');
  return found;
}

export async function toggleProductActive(
  productId: string,
  nextActive: boolean,
  actor: Profile
): Promise<void> {
  if (actor.role !== 'admin') {
    throw new Error('Akses ditolak: hanya admin yang dapat mengubah status produk.');
  }

  const supabase = await ensureSupabaseClient();
  if (supabase) {
    const { error } = await supabase
      .from('products')
      .update({ is_active: nextActive, updated_at: new Date().toISOString() })
      .eq('id', productId);
    if (error) throw new Error(error.message);
    return;
  }

  ensureLocalSeed();
  const products = readJson<RawLocalProduct[]>(LOCAL_KEYS.products, []);
  const idx = products.findIndex((p) => p.id === productId);
  if (idx === -1) throw new Error('Produk tidak ditemukan.');
  products[idx] = {
    ...products[idx],
    is_active: nextActive,
    updated_at: new Date().toISOString(),
  };
  writeJson(LOCAL_KEYS.products, products);
  syncPublicCatalogFromLocal();
}

// ============================================================================
// INVENTORY & STOCK MOVEMENTS
// ============================================================================
export async function adjustInventoryStock(
  input: {
    product_id: string;
    quantity_delta: number;
    movement_type: 'adjustment' | 'return';
    reason: string;
  },
  actor: Profile
): Promise<number> {
  if (actor.role !== 'admin') {
    throw new Error('Akses ditolak: hanya admin yang berwenang menyesuaikan stok.');
  }

  const delta = Math.round(Number(input.quantity_delta));
  if (!Number.isFinite(delta) || delta === 0) {
    throw new Error('Jumlah perubahan stok tidak boleh 0.');
  }
  const reason = input.reason.trim();
  if (!reason) {
    throw new Error('Alasan perubahan stok wajib diisi untuk audit trail.');
  }

  const supabase = await ensureSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.rpc('adjust_inventory_stock', {
      p_product_id: input.product_id,
      p_quantity_delta: delta,
      p_movement_type: input.movement_type,
      p_reason: reason,
    });
    if (error) throw new Error(error.message);
    return Number(data ?? 0);
  }

  ensureLocalSeed();
  const products = readJson<RawLocalProduct[]>(LOCAL_KEYS.products, []);
  const inventory = readJson<RawLocalInventory[]>(LOCAL_KEYS.inventory, []);
  const movements = readJson<StockMovement[]>(LOCAL_KEYS.stockMovements, []);
  const product = products.find((p) => p.id === input.product_id);
  if (!product) throw new Error('Produk tidak ditemukan.');

  const now = new Date().toISOString();
  const invIdx = inventory.findIndex((i) => i.product_id === input.product_id);
  const currentQty = invIdx > -1 ? inventory[invIdx].quantity_on_hand : 0;
  const nextQty = currentQty + delta;
  if (nextQty < 0) {
    throw new Error(`Stok akhir tidak boleh negatif (stok saat ini: ${currentQty}).`);
  }

  if (invIdx > -1) {
    inventory[invIdx] = { product_id: input.product_id, quantity_on_hand: nextQty, updated_at: now };
  } else {
    inventory.push({ product_id: input.product_id, quantity_on_hand: nextQty, updated_at: now });
  }

  movements.unshift({
    id: generateId('mov'),
    product_id: input.product_id,
    product_name: product.name,
    movement_type: input.movement_type as MovementType,
    quantity_delta: delta,
    reason,
    reference_transaction_id: null,
    reference_transaction_number: null,
    created_by: actor.id,
    created_by_name: actor.display_name,
    created_at: now,
  });

  writeJson(LOCAL_KEYS.inventory, inventory);
  writeJson(LOCAL_KEYS.stockMovements, movements);
  syncPublicCatalogFromLocal();
  return nextQty;
}

export async function listStockMovements(): Promise<StockMovement[]> {
  const supabase = await ensureSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('stock_movements')
      .select(`
        id,
        product_id,
        movement_type,
        quantity_delta,
        reason,
        reference_transaction_id,
        created_by,
        created_at,
        products ( name ),
        profiles ( display_name ),
        transactions ( transaction_number )
      `)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw new Error(error.message);

    return (data || []).map((row) => {
      const prod = Array.isArray(row.products) ? row.products[0] : row.products;
      const prof = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      const tx = Array.isArray(row.transactions) ? row.transactions[0] : row.transactions;
      return {
        id: String(row.id),
        product_id: String(row.product_id),
        product_name: (prod as { name?: string } | null)?.name || 'Produk',
        movement_type: row.movement_type as MovementType,
        quantity_delta: Number(row.quantity_delta),
        reason: String(row.reason || ''),
        reference_transaction_id: row.reference_transaction_id ? String(row.reference_transaction_id) : null,
        reference_transaction_number: (tx as { transaction_number?: string } | null)?.transaction_number ?? null,
        created_by: row.created_by ? String(row.created_by) : null,
        created_by_name: (prof as { display_name?: string } | null)?.display_name || 'Sistem',
        created_at: String(row.created_at),
      };
    });
  }

  ensureLocalSeed();
  return readJson<StockMovement[]>(LOCAL_KEYS.stockMovements, []);
}

// ============================================================================
// POS CHECKOUT & TRANSACTIONS
// ============================================================================
export async function listTransactions(): Promise<TransactionRecord[]> {
  const supabase = await ensureSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        transaction_number,
        created_by,
        status,
        payment_method,
        payment_status,
        subtotal,
        discount_total,
        grand_total,
        idempotency_key,
        created_at,
        profiles ( display_name ),
        transaction_items (
          id,
          transaction_id,
          product_id,
          product_name_snapshot,
          unit_price_snapshot,
          quantity,
          line_total
        )
      `)
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw new Error(error.message);

    return (data || []).map((row) => {
      const prof = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      const rawItems = Array.isArray(row.transaction_items) ? row.transaction_items : [];
      return {
        id: String(row.id),
        transaction_number: String(row.transaction_number),
        created_by: row.created_by ? String(row.created_by) : null,
        created_by_name: (prof as { display_name?: string } | null)?.display_name || 'Kasir',
        status: row.status as TransactionStatus,
        payment_method: row.payment_method as PaymentMethod,
        payment_status: row.payment_status as PaymentStatus,
        subtotal: Number(row.subtotal),
        discount_total: Number(row.discount_total),
        grand_total: Number(row.grand_total),
        idempotency_key: String(row.idempotency_key),
        created_at: String(row.created_at),
        items: rawItems.map((it) => ({
          id: String(it.id),
          transaction_id: String(it.transaction_id),
          product_id: String(it.product_id),
          product_name_snapshot: String(it.product_name_snapshot),
          unit_price_snapshot: Number(it.unit_price_snapshot),
          quantity: Number(it.quantity),
          line_total: Number(it.line_total),
        })),
      };
    });
  }

  ensureLocalSeed();
  const transactions = readJson<Omit<TransactionRecord, 'items'>[]>(LOCAL_KEYS.transactions, []);
  const items = readJson<TransactionItem[]>(LOCAL_KEYS.transactionItems, []);

  const itemsByTx: Record<string, TransactionItem[]> = {};
  items.forEach((it) => {
    if (!itemsByTx[it.transaction_id]) itemsByTx[it.transaction_id] = [];
    itemsByTx[it.transaction_id].push(it);
  });

  return transactions.map((tx) => ({
    ...tx,
    items: itemsByTx[tx.id] || [],
  }));
}

export async function submitPosCheckout(
  input: PosCheckoutInput,
  actor: Profile
): Promise<{ transaction: TransactionRecord; idempotentReplay: boolean }> {
  if (actor.role !== 'admin' && actor.role !== 'cashier') {
    throw new Error('Akses ditolak: role tidak memiliki izin kasir POS.');
  }
  if (!input.items || input.items.length === 0) {
    throw new Error('Keranjang POS masih kosong.');
  }

  const discount = Math.max(0, Math.round(Number(input.discount_total || 0)));

  const supabase = await ensureSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.rpc('process_pos_checkout', {
      p_items: input.items,
      p_payment_method: input.payment_method,
      p_payment_status: input.payment_status,
      p_discount_total: discount,
      p_idempotency_key: input.idempotency_key,
    });

    if (error) throw new Error(error.message);

    const payload = data as {
      transaction_id: string;
      idempotent_replay?: boolean;
    };

    const all = await listTransactions();
    const tx = all.find((t) => t.id === payload.transaction_id);
    if (!tx) throw new Error('Transaksi berhasil disimpan tetapi gagal dimuat.');
    return {
      transaction: tx,
      idempotentReplay: Boolean(payload.idempotent_replay),
    };
  }

  // Local Sandbox Atomic Transaction Simulation (semua validasi dilakukan di sini)
  ensureLocalSeed();
  const products = readJson<RawLocalProduct[]>(LOCAL_KEYS.products, []);
  const inventory = readJson<RawLocalInventory[]>(LOCAL_KEYS.inventory, []);
  const transactions = readJson<Omit<TransactionRecord, 'items'>[]>(LOCAL_KEYS.transactions, []);
  const txItems = readJson<TransactionItem[]>(LOCAL_KEYS.transactionItems, []);
  const movements = readJson<StockMovement[]>(LOCAL_KEYS.stockMovements, []);

  // Idempotency check
  const existing = transactions.find((t) => t.idempotency_key === input.idempotency_key);
  if (existing) {
    const existingItems = txItems.filter((it) => it.transaction_id === existing.id);
    return {
      transaction: { ...existing, items: existingItems },
      idempotentReplay: true,
    };
  }

  // Clone inventory for atomic commit-or-rollback semantics
  const nextInventory = inventory.map((i) => ({ ...i }));
  const builtItems: TransactionItem[] = [];
  const builtMovements: StockMovement[] = [];
  const nowDate = new Date();
  const nowIso = nowDate.toISOString();
  const txId = generateId('tx');

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const seqNum = String(transactions.length + 1).padStart(4, '0');
  const txNumber = `TRX-${nowDate.getFullYear()}${pad2(nowDate.getMonth() + 1)}${pad2(nowDate.getDate())}-${seqNum}`;

  let subtotal = 0;

  for (const item of input.items) {
    const qty = Math.round(Number(item.quantity));
    if (!Number.isFinite(qty) || qty <= 0) {
      throw new Error('Kuantitas produk harus lebih dari 0.');
    }

    const product = products.find((p) => p.id === item.product_id);
    if (!product) {
      throw new Error('Produk tidak ditemukan.');
    }
    if (!product.is_active) {
      throw new Error(`Produk "${product.name}" sedang nonaktif dan tidak dapat dijual.`);
    }

    const invRecord = nextInventory.find((i) => i.product_id === product.id);
    const available = invRecord ? invRecord.quantity_on_hand : 0;
    if (available < qty) {
      throw new Error(`Stok "${product.name}" tidak mencukupi (tersisa ${available}).`);
    }

    // Kurangi stok pada salinan atomik
    if (invRecord) {
      invRecord.quantity_on_hand -= qty;
      invRecord.updated_at = nowIso;
    }

    const lineTotal = product.price * qty;
    subtotal += lineTotal;

    builtItems.push({
      id: generateId('txi'),
      transaction_id: txId,
      product_id: product.id,
      product_name_snapshot: product.name,
      unit_price_snapshot: product.price,
      quantity: qty,
      line_total: lineTotal,
    });

    builtMovements.push({
      id: generateId('mov'),
      product_id: product.id,
      product_name: product.name,
      movement_type: 'sale',
      quantity_delta: -qty,
      reason: `Penjualan POS ${txNumber}`,
      reference_transaction_id: txId,
      reference_transaction_number: txNumber,
      created_by: actor.id,
      created_by_name: actor.display_name,
      created_at: nowIso,
    });
  }

  if (discount > subtotal) {
    throw new Error('Total diskon tidak boleh melebihi subtotal.');
  }

  const grandTotal = subtotal - discount;
  const newTx: Omit<TransactionRecord, 'items'> = {
    id: txId,
    transaction_number: txNumber,
    created_by: actor.id,
    created_by_name: actor.display_name,
    status: 'completed',
    payment_method: input.payment_method as PaymentMethod,
    payment_status: input.payment_status as PaymentStatus,
    subtotal,
    discount_total: discount,
    grand_total: grandTotal,
    idempotency_key: input.idempotency_key,
    created_at: nowIso,
  };

  // Commit seluruh perubahan secara serentak
  writeJson(LOCAL_KEYS.inventory, nextInventory);
  writeJson(LOCAL_KEYS.transactions, [newTx, ...transactions]);
  writeJson(LOCAL_KEYS.transactionItems, [...builtItems, ...txItems]);
  writeJson(LOCAL_KEYS.stockMovements, [...builtMovements, ...movements]);
  syncPublicCatalogFromLocal();

  return {
    transaction: { ...newTx, items: builtItems },
    idempotentReplay: false,
  };
}

export async function cancelOrRefundTransaction(
  input: { transaction_id: string; new_status: 'cancelled' | 'refunded'; reason: string },
  actor: Profile
): Promise<void> {
  if (actor.role !== 'admin') {
    throw new Error('Akses ditolak: hanya admin yang dapat membatalkan atau merefund transaksi.');
  }
  const reason = input.reason.trim();
  if (!reason) {
    throw new Error('Alasan pembatalan/refund wajib diisi.');
  }

  const supabase = await ensureSupabaseClient();
  if (supabase) {
    const { error } = await supabase.rpc('cancel_or_refund_transaction', {
      p_transaction_id: input.transaction_id,
      p_new_status: input.new_status,
      p_reason: reason,
    });
    if (error) throw new Error(error.message);
    return;
  }

  ensureLocalSeed();
  const transactions = readJson<Omit<TransactionRecord, 'items'>[]>(LOCAL_KEYS.transactions, []);
  const txItems = readJson<TransactionItem[]>(LOCAL_KEYS.transactionItems, []);
  const inventory = readJson<RawLocalInventory[]>(LOCAL_KEYS.inventory, []);
  const movements = readJson<StockMovement[]>(LOCAL_KEYS.stockMovements, []);

  const txIdx = transactions.findIndex((t) => t.id === input.transaction_id);
  if (txIdx === -1) throw new Error('Transaksi tidak ditemukan.');

  const tx = transactions[txIdx];
  if (tx.status !== 'completed') {
    throw new Error('Hanya transaksi berstatus completed yang dapat diubah.');
  }

  const now = new Date().toISOString();
  transactions[txIdx] = {
    ...tx,
    status: input.new_status,
    payment_status: input.new_status === 'refunded' ? 'refunded' : tx.payment_status,
  };

  const items = txItems.filter((it) => it.transaction_id === tx.id);
  const returnMovements: StockMovement[] = [];

  for (const item of items) {
    const invIdx = inventory.findIndex((i) => i.product_id === item.product_id);
    if (invIdx > -1) {
      inventory[invIdx] = {
        ...inventory[invIdx],
        quantity_on_hand: inventory[invIdx].quantity_on_hand + item.quantity,
        updated_at: now,
      };
    }
    returnMovements.push({
      id: generateId('mov'),
      product_id: item.product_id,
      product_name: item.product_name_snapshot,
      movement_type: 'return',
      quantity_delta: item.quantity,
      reason: `${reason} (${tx.transaction_number})`,
      reference_transaction_id: tx.id,
      reference_transaction_number: tx.transaction_number,
      created_by: actor.id,
      created_by_name: actor.display_name,
      created_at: now,
    });
  }

  writeJson(LOCAL_KEYS.transactions, transactions);
  writeJson(LOCAL_KEYS.inventory, inventory);
  writeJson(LOCAL_KEYS.stockMovements, [...returnMovements, ...movements]);
  syncPublicCatalogFromLocal();
}
