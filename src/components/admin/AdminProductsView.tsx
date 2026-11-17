import React, { useMemo, useRef, useState } from 'react';
import {
  Plus,
  Search,
  Edit3,
  ArrowUpDown,
  Power,
  Tag,
  X,
  AlertCircle,
  PackageCheck,
  History,
  Camera,
  Upload,
} from 'lucide-react';
import { AdminProduct, Category, StockMovement } from '../../types';
import { useAdminAuth } from './AdminAuthContext';
import {
  adjustInventoryStock,
  saveAdminProduct,
  saveCategory,
  toggleProductActive,
  uploadProductPhoto,
} from '../../services/adminBackendService';
import { formatRupiah } from '../../utils/currency';
import { ProductPhotoModal } from './ProductPhotoModal';

interface AdminProductsViewProps {
  products: AdminProduct[];
  categories: Category[];
  movements: StockMovement[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}

const PRESET_PRODUCT_IMAGES = [
  { label: 'Makaroni Basah', url: '/images/makaroni-basah.jpg' },
  { label: 'Makaroni Kering', url: '/images/makaroni-kering.jpg' },
  { label: 'Es Teh Lemon', url: '/images/es-teh-lemon.jpg' },
  { label: 'Es Teh Manis', url: '/images/es-teh.jpg' },
  { label: 'Hero Standar', url: '/images/hero.jpg' },
];

export const AdminProductsView: React.FC<AdminProductsViewProps> = ({
  products,
  categories,
  movements,
  loading,
  onRefresh,
}) => {
  const { profile } = useAdminAuth();
  const isAdmin = profile?.role === 'admin';

  const [subTab, setSubTab] = useState<'catalog' | 'movements'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Product Upsert Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodCategoryId, setProdCategoryId] = useState<string>('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodPrice, setProdPrice] = useState('0');
  const [prodImageUrl, setProdImageUrl] = useState('/images/hero.jpg');
  const [prodIsActive, setProdIsActive] = useState(true);
  const [prodInitialStock, setProdInitialStock] = useState('0');
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isUploadingInForm, setIsUploadingInForm] = useState(false);
  const [productFormError, setProductFormError] = useState<string | null>(null);
  const formPhotoInputRef = useRef<HTMLInputElement>(null);

  // Dedicated Product Photo Modal State
  const [photoModalProduct, setPhotoModalProduct] = useState<AdminProduct | null>(null);

  // Category Modal State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | undefined>(undefined);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [isSavingCat, setIsSavingCat] = useState(false);
  const [catFormError, setCatFormError] = useState<string | null>(null);

  // Stock Adjustment Modal State
  const [stockModalProduct, setStockModalProduct] = useState<AdminProduct | null>(null);
  const [movementType, setMovementType] = useState<'adjustment' | 'return'>('adjustment');
  const [deltaInput, setDeltaInput] = useState('0');
  const [reasonInput, setReasonInput] = useState('');
  const [isSavingStock, setIsSavingStock] = useState(false);
  const [stockFormError, setStockFormError] = useState<string | null>(null);

  // Movements Filter
  const [movementSearch, setMovementSearch] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState<'all' | 'sale' | 'adjustment' | 'return'>('all');

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter !== 'all' && p.category_id !== categoryFilter) return false;
      if (statusFilter === 'active' && !p.is_active) return false;
      if (statusFilter === 'inactive' && p.is_active) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [products, categoryFilter, statusFilter, searchQuery]);

  const filteredMovements = useMemo(() => {
    const q = movementSearch.trim().toLowerCase();
    return movements.filter((m) => {
      if (movementTypeFilter !== 'all' && m.movement_type !== movementTypeFilter) return false;
      if (
        q &&
        !(m.product_name || '').toLowerCase().includes(q) &&
        !m.reason.toLowerCase().includes(q) &&
        !(m.reference_transaction_number || '').toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [movements, movementTypeFilter, movementSearch]);

  const openCreateProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategoryId(categories[0]?.id || '');
    setProdDescription('');
    setProdPrice('8000');
    setProdImageUrl('/images/hero.jpg');
    setProdIsActive(true);
    setProdInitialStock('20');
    setProductFormError(null);
    setProductModalOpen(true);
  };

  const openEditProduct = (product: AdminProduct) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdCategoryId(product.category_id || '');
    setProdDescription(product.description);
    setProdPrice(String(product.price));
    setProdImageUrl(product.image_url);
    setProdIsActive(product.is_active);
    setProdInitialStock(String(product.quantity_on_hand));
    setProductFormError(null);
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setProductFormError(null);

    const parsedPrice = Number.parseInt(prodPrice.replace(/[^0-9]/g, ''), 10);
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setProductFormError('Harga harus berupa angka bulat >= 0.');
      return;
    }

    const parsedInitialStock = Number.parseInt(prodInitialStock.replace(/[^0-9]/g, '') || '0', 10);
    if (!editingProduct && (!Number.isFinite(parsedInitialStock) || parsedInitialStock < 0)) {
      setProductFormError('Stok awal harus berupa angka bulat >= 0.');
      return;
    }

    setIsSavingProduct(true);
    try {
      await saveAdminProduct(
        {
          id: editingProduct?.id,
          category_id: prodCategoryId || null,
          name: prodName,
          description: prodDescription,
          price: parsedPrice,
          image_url: prodImageUrl,
          is_active: prodIsActive,
          initial_stock: editingProduct ? undefined : parsedInitialStock,
        },
        profile
      );
      setProductModalOpen(false);
      setActionSuccess(
        editingProduct ? `Produk "${prodName.trim()}" diperbarui.` : `Produk baru "${prodName.trim()}" ditambahkan.`
      );
      setActionError(null);
      await onRefresh();
    } catch (err) {
      setProductFormError(err instanceof Error ? err.message : 'Gagal menyimpan produk.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleFormPhotoUpload = async (file: File | undefined) => {
    if (!file || !profile) return;
    setProductFormError(null);
    setIsUploadingInForm(true);
    try {
      const result = await uploadProductPhoto(file, editingProduct?.id || 'new', profile);
      setProdImageUrl(result.url);
    } catch (err) {
      setProductFormError(err instanceof Error ? err.message : 'Gagal mengunggah foto.');
    } finally {
      setIsUploadingInForm(false);
      if (formPhotoInputRef.current) formPhotoInputRef.current.value = '';
    }
  };

  const handleToggleActive = async (product: AdminProduct) => {
    if (!profile) return;
    setActionError(null);
    setActionSuccess(null);
    try {
      await toggleProductActive(product.id, !product.is_active, profile);
      setActionSuccess(
        `Produk "${product.name}" sekarang ${!product.is_active ? 'Aktif' : 'Nonaktif'}.`
      );
      await onRefresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal mengubah status produk.');
    }
  };

  const openCategoryModal = () => {
    setEditingCatId(undefined);
    setCatName('');
    setCatSlug('');
    setCatFormError(null);
    setCategoryModalOpen(true);
  };

  const handleCatNameChange = (val: string) => {
    setCatName(val);
    if (!editingCatId) {
      setCatSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setCatFormError(null);
    setIsSavingCat(true);
    try {
      await saveCategory(
        { id: editingCatId, name: catName, slug: catSlug },
        profile.role
      );
      setEditingCatId(undefined);
      setCatName('');
      setCatSlug('');
      setActionSuccess('Daftar kategori diperbarui.');
      await onRefresh();
    } catch (err) {
      setCatFormError(err instanceof Error ? err.message : 'Gagal menyimpan kategori.');
    } finally {
      setIsSavingCat(false);
    }
  };

  const openStockModal = (product: AdminProduct) => {
    setStockModalProduct(product);
    setMovementType('adjustment');
    setDeltaInput('10');
    setReasonInput('');
    setStockFormError(null);
  };

  const parsedDelta = Number.parseInt(deltaInput, 10);
  const previewStock = stockModalProduct
    ? stockModalProduct.quantity_on_hand + (Number.isFinite(parsedDelta) ? parsedDelta : 0)
    : 0;

  const handleSaveStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !stockModalProduct) return;
    setStockFormError(null);

    if (!Number.isFinite(parsedDelta) || parsedDelta === 0) {
      setStockFormError('Masukkan angka delta stok selain 0 (contoh: 10 atau -5).');
      return;
    }
    if (previewStock < 0) {
      setStockFormError(
        `Stok akhir tidak boleh negatif (stok saat ini ${stockModalProduct.quantity_on_hand}).`
      );
      return;
    }

    setIsSavingStock(true);
    try {
      await adjustInventoryStock(
        {
          product_id: stockModalProduct.id,
          quantity_delta: parsedDelta,
          movement_type: movementType,
          reason: reasonInput,
        },
        profile
      );
      setStockModalProduct(null);
      setActionSuccess(`Stok "${stockModalProduct.name}" diperbarui menjadi ${previewStock}.`);
      setActionError(null);
      await onRefresh();
    } catch (err) {
      setStockFormError(err instanceof Error ? err.message : 'Gagal menyesuaikan stok.');
    } finally {
      setIsSavingStock(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#C7320B] tracking-tight">
            Manajemen Produk &amp; Inventori
          </h1>
          <p className="text-xs sm:text-sm text-[#6E2C1B] mt-0.5">
            Kelola katalog, harga Rupiah, status aktif/nonaktif (tanpa hapus riwayat lama), serta audit mutasi stok.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={openCategoryModal}
              className="px-3.5 py-2 bg-[#FFFDF5] border border-[#EAD29C] hover:border-[#FF8234] text-[#C7320B] text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Kategori</span>
            </button>
            <button
              type="button"
              onClick={openCreateProduct}
              className="px-4 py-2 bg-[#C7320B] hover:bg-[#A12606] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk</span>
            </button>
          </div>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="inline-flex p-1 bg-[#F5E7B8]/70 border border-[#EAD29C] rounded-xl gap-1">
        <button
          type="button"
          onClick={() => setSubTab('catalog')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            subTab === 'catalog' ? 'bg-[#C7320B] text-white' : 'text-[#6E2C1B] hover:text-[#C7320B]'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5" />
          <span>Daftar Produk ({products.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('movements')}
          className={`px-3.5 py-1.5 text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            subTab === 'movements' ? 'bg-[#C7320B] text-white' : 'text-[#6E2C1B] hover:text-[#C7320B]'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Mutasi Stok ({movements.length})</span>
        </button>
      </div>

      {/* Feedback Banner */}
      {actionError && (
        <div className="p-3.5 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 text-xs font-semibold text-[#DC2626] flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {actionError}
          </span>
          <button type="button" onClick={() => setActionError(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/30 text-xs font-semibold text-[#16A34A] flex items-center justify-between gap-2">
          <span>{actionSuccess}</span>
          <button type="button" onClick={() => setActionSuccess(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!isAdmin && (
        <div className="p-3.5 rounded-xl bg-[#F5E7B8]/70 border border-[#EAD29C] text-xs text-[#6E2C1B]">
          Kamu login sebagai <strong className="text-[#C7320B]">Kasir</strong>. Perubahan harga, status produk, dan penyesuaian stok manual hanya dapat dilakukan oleh akun Admin.
        </div>
      )}

      {subTab === 'catalog' ? (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#6E2C1B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau deskripsi produk..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#EAD29C] rounded-xl text-[#3E1004] focus:outline-none focus:ring-2 focus:ring-[#FF8234]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs font-bold bg-white border border-[#EAD29C] rounded-xl text-[#3E1004] focus:outline-none focus:ring-2 focus:ring-[#FF8234]"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 text-xs font-bold bg-white border border-[#EAD29C] rounded-xl text-[#3E1004] focus:outline-none focus:ring-2 focus:ring-[#FF8234]"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif Saja</option>
                <option value="inactive">Nonaktif Saja</option>
              </select>
            </div>
          </div>

          {/* Product Table */}
          <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#6E2C1B]">Memuat produk...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6E2C1B]">
                Tidak ada produk yang cocok dengan filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5E7B8]/50 border-b border-[#EAD29C] text-[#6E2C1B] font-bold">
                    <tr>
                      <th className="py-3 px-4">Produk</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4 text-right">Harga</th>
                      <th className="py-3 px-4 text-right">Stok</th>
                      <th className="py-3 px-4">Status</th>
                      {isAdmin && <th className="py-3 px-4 text-right">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAD29C]/60">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-[#FCF6E0]/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3 min-w-[200px]">
                            <button
                              type="button"
                              disabled={!isAdmin}
                              onClick={() => isAdmin && setPhotoModalProduct(product)}
                              title={isAdmin ? 'Klik untuk ganti foto produk' : product.name}
                              className={`w-11 h-11 rounded-xl bg-[#F5E7B8] border border-[#EAD29C] overflow-hidden shrink-0 flex items-center justify-center relative group ${
                                isAdmin ? 'cursor-pointer hover:border-[#C7320B]' : ''
                              }`}
                            >
                              {product.image_url ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <span className="font-heading font-black text-sm text-[#C7320B]">
                                  {product.name.slice(0, 1)}
                                </span>
                              )}
                            </button>
                            <div className="min-w-0">
                              <p className="font-bold text-sm text-[#C7320B] truncate">
                                {product.name}
                              </p>
                              <p className="text-[11px] text-[#6E2C1B] line-clamp-1 max-w-xs">
                                {product.description || 'Tanpa deskripsi'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-[#3E1004] font-semibold whitespace-nowrap">
                          {product.category_name}
                        </td>

                        <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-[#3E1004] whitespace-nowrap">
                          {formatRupiah(product.price)}
                        </td>

                        <td className="py-3 px-4 text-right font-mono tabular-nums font-black whitespace-nowrap">
                          <span
                            className={
                              product.quantity_on_hand === 0
                                ? 'text-[#DC2626]'
                                : product.quantity_on_hand <= 10
                                ? 'text-[#D97706]'
                                : 'text-[#16A34A]'
                            }
                          >
                            {product.quantity_on_hand}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap font-bold">
                          <span
                            className={
                              product.is_active ? 'text-[#16A34A]' : 'text-[#6E2C1B]/70'
                            }
                          >
                            {product.is_active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>

                        {isAdmin && (
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setPhotoModalProduct(product)}
                                className="px-2.5 py-1.5 bg-white border border-[#EAD29C] hover:border-[#FF8234] text-[#C7320B] font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer"
                                title="Ganti foto produk"
                              >
                                <Camera className="w-3 h-3" />
                                <span>Foto</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditProduct(product)}
                                className="px-2.5 py-1.5 bg-white border border-[#EAD29C] hover:border-[#FF8234] text-[#C7320B] font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer"
                                title="Edit produk"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openStockModal(product)}
                                className="px-2.5 py-1.5 bg-white border border-[#EAD29C] hover:border-[#FF8234] text-[#C7320B] font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer"
                                title="Sesuaikan stok"
                              >
                                <ArrowUpDown className="w-3 h-3" />
                                <span>Stok</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleToggleActive(product)}
                                className={`px-2.5 py-1.5 border font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer ${
                                  product.is_active
                                    ? 'bg-white border-[#EAD29C] text-[#6E2C1B] hover:border-[#DC2626] hover:text-[#DC2626]'
                                    : 'bg-[#16A34A]/10 border-[#16A34A]/30 text-[#16A34A]'
                                }`}
                                title={product.is_active ? 'Nonaktifkan produk' : 'Aktifkan produk'}
                              >
                                <Power className="w-3 h-3" />
                                <span>{product.is_active ? 'Nonaktifkan' : 'Aktifkan'}</span>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Stock Movements Immutable Audit Log */
        <div className="space-y-4">
          <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#6E2C1B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={movementSearch}
                onChange={(e) => setMovementSearch(e.target.value)}
                placeholder="Cari produk, alasan, atau no. transaksi..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#EAD29C] rounded-xl text-[#3E1004] focus:outline-none focus:ring-2 focus:ring-[#FF8234]"
              />
            </div>

            <select
              value={movementTypeFilter}
              onChange={(e) =>
                setMovementTypeFilter(e.target.value as 'all' | 'sale' | 'adjustment' | 'return')
              }
              className="px-3 py-2 text-xs font-bold bg-white border border-[#EAD29C] rounded-xl text-[#3E1004] focus:outline-none focus:ring-2 focus:ring-[#FF8234]"
            >
              <option value="all">Semua Tipe Mutasi</option>
              <option value="sale">Penjualan (sale)</option>
              <option value="adjustment">Penyesuaian (adjustment)</option>
              <option value="return">Retur (return)</option>
            </select>
          </div>

          <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl overflow-hidden">
            {filteredMovements.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6E2C1B] space-y-1">
                <p className="font-bold text-[#C7320B]">Belum ada mutasi stok tercatat</p>
                <p>
                  Setiap transaksi POS, penambahan stok awal, penyesuaian admin, maupun refund akan dicatat otomatis dan tidak dapat diedit bebas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5E7B8]/50 border-b border-[#EAD29C] text-[#6E2C1B] font-bold">
                    <tr>
                      <th className="py-3 px-4">Waktu</th>
                      <th className="py-3 px-4">Produk</th>
                      <th className="py-3 px-4">Tipe</th>
                      <th className="py-3 px-4 text-right">Delta</th>
                      <th className="py-3 px-4">Alasan</th>
                      <th className="py-3 px-4">Ref. Transaksi</th>
                      <th className="py-3 px-4">Petugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAD29C]/60">
                    {filteredMovements.map((mov) => (
                      <tr key={mov.id} className="hover:bg-[#FCF6E0]/60 transition-colors">
                        <td className="py-3 px-4 font-mono tabular-nums text-[#6E2C1B] whitespace-nowrap">
                          {new Date(mov.created_at).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4 font-bold text-[#3E1004]">
                          {mov.product_name || 'Produk'}
                        </td>
                        <td className="py-3 px-4 font-semibold uppercase text-[#6E2C1B] whitespace-nowrap">
                          {mov.movement_type}
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-mono tabular-nums font-black whitespace-nowrap ${
                            mov.quantity_delta >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                          }`}
                        >
                          {mov.quantity_delta > 0 ? `+${mov.quantity_delta}` : mov.quantity_delta}
                        </td>
                        <td className="py-3 px-4 text-[#3E1004]">{mov.reason}</td>
                        <td className="py-3 px-4 font-mono tabular-nums text-[#C7320B] whitespace-nowrap">
                          {mov.reference_transaction_number || '—'}
                        </td>
                        <td className="py-3 px-4 text-[#6E2C1B] whitespace-nowrap">
                          {mov.created_by_name || 'Sistem'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Tambah / Edit Produk */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div
            onClick={() => setProductModalOpen(false)}
            className="fixed inset-0 bg-[#3E1004]/50 backdrop-blur-xs"
          />
          <div className="min-h-full flex items-center justify-center p-4">
            <form
              onSubmit={(e) => void handleSaveProduct(e)}
              className="relative bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EAD29C]">
                <h2 className="font-heading text-lg font-black text-[#C7320B]">
                  {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                </h2>
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="p-1 text-[#6E2C1B] hover:text-[#C7320B] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {productFormError && (
                <div className="p-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 text-xs font-semibold text-[#DC2626]">
                  {productFormError}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#6E2C1B] mb-1">
                    Nama Produk
                  </label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="Contoh: Makaroni Basah Pedas"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#EAD29C] rounded-xl text-[#3E1004] focus:outline-none focus:ring-2 focus:ring-[#FF8234]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#6E2C1B] mb-1">Kategori</label>
                    <select
                      value={prodCategoryId}
                      onChange={(e) => setProdCategoryId(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-[#EAD29C] rounded-xl text-[#3E1004] focus:outline-none focus:ring-2 focus:ring-[#FF8234]"
                    >
                      <option value="">Tanpa Kategori</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#6E2C1B] mb-1">
                      Harga (Rupiah)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={500}
                      required
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-[#EAD29C] rounded-xl text-[#3E1004] focus:outline-none focus:ring-2 focus:ring-[#FF8234]"
                    />
                  </div>
                </div>

                {!editingProduct && (
                  <div>
                    <label className="block text-xs font-bold text-[#6E2C1B] mb-1">
                      Stok Awal (Inventory)
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={prodInitialStock}
                      onChange={(e) => setProdInitialStock(e.target.value)}
                      className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-[#EAD29C] rounded-xl text-[#3E1004] focus:outline-none focus:ring-2 focus:ring-[#FF8234]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#6E2C1B] mb-1">Deskripsi</label>
                  <textarea
                    rows={2}
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    placeholder="Keterangan singkat produk untuk katalog pembeli..."
                    className="w-full px-3 py-2 text-sm bg-white border border-[#EAD29C] rounded-xl text-[#3E1004] focus:outline-none focus:ring-2 focus:ring-[#FF8234]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#6E2C1B]">
                      Foto Produk (Upload atau URL)
                    </label>
                    <input
                      ref={formPhotoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => void handleFormPhotoUpload(e.target.files?.[0])}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingInForm}
                      onClick={() => formPhotoInputRef.current?.click()}
                      className="px-2.5 py-1 text-[11px] font-bold text-[#C7320B] bg-[#F5E7B8] hover:bg-[#EAD29C] rounded-lg inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{isUploadingInForm ? 'Mengunggah...' : 'Upload dari Perangkat'}</span>
                    </button>
                  </div>
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-xl bg-[#F5E7B8] border border-[#EAD29C] overflow-hidden shrink-0 flex items-center justify-center">
                      {prodImageUrl ? (
                        <img
                          src={prodImageUrl}
                          alt="Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="font-heading font-black text-sm text-[#C7320B]">?</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={prodImageUrl.startsWith('data:image/') ? '' : prodImageUrl}
                      onChange={(e) => setProdImageUrl(e.target.value)}
                      placeholder={
                        prodImageUrl.startsWith('data:image/')
                          ? 'Foto dari perangkat siap disimpan (tempel URL jika ingin ganti)'
                          : '/images/makaroni-basah.jpg atau https://...'
                      }
                      className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-[#EAD29C] rounded-xl text-[#3E1004] focus:outline-none focus:ring-2 focus:ring-[#FF8234]"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {PRESET_PRODUCT_IMAGES.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setProdImageUrl(preset.url)}
                        className="px-2 py-1 text-[10px] font-bold bg-[#F5E7B8]/70 hover:bg-[#F5E7B8] text-[#C7320B] rounded-lg cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodIsActive}
                    onChange={(e) => setProdIsActive(e.target.checked)}
                    className="w-4 h-4 accent-[#C7320B]"
                  />
                  <span className="text-xs font-bold text-[#3E1004]">
                    Tampilkan sebagai produk aktif di Website Publik &amp; POS
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EAD29C]">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#6E2C1B] hover:bg-[#F5E7B8]/60 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-5 py-2 bg-[#C7320B] hover:bg-[#A12606] disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  {isSavingProduct ? 'Menyimpan...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Sesuaikan Stok */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div
            onClick={() => setStockModalProduct(null)}
            className="fixed inset-0 bg-[#3E1004]/50 backdrop-blur-xs"
          />
          <div className="min-h-full flex items-center justify-center p-4">
            <form
              onSubmit={(e) => void handleSaveStockAdjustment(e)}
              className="relative bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#EAD29C]">
                <div>
                  <h2 className="font-heading text-lg font-black text-[#C7320B]">
                    Sesuaikan Stok Produk
                  </h2>
                  <p className="text-xs text-[#6E2C1B] font-semibold">
                    {stockModalProduct.name} · Stok saat ini:{' '}
                    <span className="font-mono tabular-nums font-black text-[#C7320B]">
                      {stockModalProduct.quantity_on_hand}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStockModalProduct(null)}
                  className="p-1 text-[#6E2C1B] hover:text-[#C7320B] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {stockFormError && (
                <div className="p-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 text-xs font-semibold text-[#DC2626]">
                  {stockFormError}
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#6E2C1B] mb-1">
                    Tipe Mutasi
                  </label>
                  <select
                    value={movementType}
                    onChange={(e) => setMovementType(e.target.value as 'adjustment' | 'return')}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#EAD29C] rounded-xl text-[#3E1004]"
                  >
                    <option value="adjustment">Penyesuaian Stok (adjustment)</option>
                    <option value="return">Retur Masuk (return)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#6E2C1B] mb-1">
                    Perubahan Jumlah (+ tambah / - kurangi)
                  </label>
                  <input
                    type="number"
                    required
                    value={deltaInput}
                    onChange={(e) => setDeltaInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-[#EAD29C] rounded-xl text-[#3E1004]"
                  />
                  <p className="text-[11px] text-[#6E2C1B] mt-1 font-mono tabular-nums">
                    Estimasi stok akhir:{' '}
                    <strong className={previewStock < 0 ? 'text-[#DC2626]' : 'text-[#16A34A]'}>
                      {previewStock}
                    </strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#6E2C1B] mb-1">
                    Alasan Mutasi (Wajib)
                  </label>
                  <input
                    type="text"
                    required
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
                    placeholder="Contoh: Restock batch pagi / barang rusak"
                    className="w-full px-3 py-2 text-sm bg-white border border-[#EAD29C] rounded-xl text-[#3E1004]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EAD29C]">
                <button
                  type="button"
                  onClick={() => setStockModalProduct(null)}
                  className="px-4 py-2 text-xs font-bold text-[#6E2C1B] hover:bg-[#F5E7B8]/60 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingStock || previewStock < 0}
                  className="px-5 py-2 bg-[#C7320B] hover:bg-[#A12606] disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  {isSavingStock ? 'Menyimpan...' : 'Simpan Mutasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Kelola Kategori */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div
            onClick={() => setCategoryModalOpen(false)}
            className="fixed inset-0 bg-[#3E1004]/50 backdrop-blur-xs"
          />
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAD29C]">
                <h2 className="font-heading text-lg font-black text-[#C7320B]">
                  Kelola Kategori Produk
                </h2>
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="p-1 text-[#6E2C1B] hover:text-[#C7320B] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="divide-y divide-[#EAD29C]/60 max-h-48 overflow-y-auto border border-[#EAD29C] rounded-xl bg-white">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="px-3.5 py-2.5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#3E1004]">{cat.name}</p>
                      <p className="font-mono text-[11px] text-[#6E2C1B]">{cat.slug}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCatId(cat.id);
                        setCatName(cat.name);
                        setCatSlug(cat.slug);
                        setCatFormError(null);
                      }}
                      className="text-xs font-bold text-[#C7320B] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={(e) => void handleSaveCategory(e)} className="space-y-3 pt-2">
                {catFormError && (
                  <div className="p-2.5 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 text-xs font-semibold text-[#DC2626]">
                    {catFormError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-[#6E2C1B] mb-1">Nama</label>
                    <input
                      type="text"
                      required
                      value={catName}
                      onChange={(e) => handleCatNameChange(e.target.value)}
                      placeholder="Contoh: Camilan"
                      className="w-full px-3 py-2 text-xs bg-white border border-[#EAD29C] rounded-xl text-[#3E1004]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#6E2C1B] mb-1">Slug Unik</label>
                    <input
                      type="text"
                      required
                      value={catSlug}
                      onChange={(e) => setCatSlug(e.target.value)}
                      placeholder="camilan"
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#EAD29C] rounded-xl text-[#3E1004]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  {editingCatId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCatId(undefined);
                        setCatName('');
                        setCatSlug('');
                      }}
                      className="px-3 py-2 text-xs font-bold text-[#6E2C1B] cursor-pointer"
                    >
                      Batal Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSavingCat}
                    className="px-4 py-2 bg-[#C7320B] hover:bg-[#A12606] text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    {isSavingCat
                      ? 'Menyimpan...'
                      : editingCatId
                      ? 'Perbarui Kategori'
                      : 'Tambah Kategori'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Dedicated Modal: Ganti Foto Produk */}
      <ProductPhotoModal
        product={photoModalProduct}
        actor={profile}
        onClose={() => setPhotoModalProduct(null)}
        onSaved={async (msg) => {
          setActionSuccess(msg);
          setActionError(null);
          await onRefresh();
        }}
      />
    </div>
  );
};
