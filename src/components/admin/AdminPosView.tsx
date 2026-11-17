import React, { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShoppingCart,
  Receipt,
} from 'lucide-react';
import {
  AdminProduct,
  Category,
  PaymentMethod,
  TransactionRecord,
} from '../../types';
import { useAdminAuth } from './AdminAuthContext';
import { submitPosCheckout } from '../../services/adminBackendService';
import { formatRupiah } from '../../utils/currency';

interface AdminPosViewProps {
  products: AdminProduct[];
  categories: Category[];
  onCheckoutSuccess: () => Promise<void>;
}

interface PosCartLine {
  product: AdminProduct;
  quantity: number;
}

function createIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `pos-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const AdminPosView: React.FC<AdminPosViewProps> = ({
  products,
  categories,
  onCheckoutSuccess,
}) => {
  const { profile } = useAdminAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<PosCartLine[]>([]);
  const [discountInput, setDiscountInput] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('paid');
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => createIdempotencyKey());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receiptTx, setReceiptTx] = useState<TransactionRecord | null>(null);

  const activeProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (!p.is_active) return false;
      if (selectedCategory !== 'all' && p.category_id !== selectedCategory) return false;
      if (q && !p.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  const subtotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
    [cart]
  );

  const parsedDiscount = useMemo(() => {
    const num = Number.parseInt(discountInput.replace(/[^0-9]/g, ''), 10);
    if (!Number.isFinite(num) || num < 0) return 0;
    return Math.min(num, subtotal);
  }, [discountInput, subtotal]);

  const grandTotal = Math.max(0, subtotal - parsedDiscount);

  const addProductToCart = (product: AdminProduct) => {
    setErrorMsg(null);
    if (product.quantity_on_hand <= 0) {
      setErrorMsg(`Stok "${product.name}" sedang habis.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        if (existing.quantity + 1 > product.quantity_on_hand) {
          setErrorMsg(
            `Maksimal pembelian "${product.name}" adalah ${product.quantity_on_hand} sesuai stok tersedia.`
          );
          return prev;
        }
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateLineQty = (productId: string, delta: number) => {
    setErrorMsg(null);
    setCart((prev) =>
      prev
        .map((line) => {
          if (line.product.id !== productId) return line;
          const nextQty = line.quantity + delta;
          if (nextQty <= 0) return null;
          const latestProduct = products.find((p) => p.id === productId) || line.product;
          if (nextQty > latestProduct.quantity_on_hand) {
            setErrorMsg(`Stok "${latestProduct.name}" hanya tersisa ${latestProduct.quantity_on_hand}.`);
            return line;
          }
          return { ...line, product: latestProduct, quantity: nextQty };
        })
        .filter((item): item is PosCartLine => item !== null)
    );
  };

  const removeLine = (productId: string) => {
    setCart((prev) => prev.filter((l) => l.product.id !== productId));
  };

  const resetCartForNextOrder = () => {
    setCart([]);
    setDiscountInput('0');
    setPaymentMethod('cash');
    setPaymentStatus('paid');
    setIdempotencyKey(createIdempotencyKey());
    setErrorMsg(null);
  };

  const handleCheckout = async () => {
    if (!profile) return;
    if (cart.length === 0) {
      setErrorMsg('Pilih minimal 1 produk sebelum menyimpan transaksi.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const result = await submitPosCheckout(
        {
          items: cart.map((line) => ({
            product_id: line.product.id,
            quantity: line.quantity,
          })),
          payment_method: paymentMethod,
          payment_status: paymentStatus,
          discount_total: parsedDiscount,
          idempotency_key: idempotencyKey,
        },
        profile
      );

      setReceiptTx(result.transaction);
      resetCartForNextOrder();
      await onCheckoutSuccess();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#C7320B] tracking-tight">
          Point of Sale (POS)
        </h1>
        <p className="text-xs sm:text-sm text-[#6E2C1B] mt-0.5">
          Pilih produk aktif, atur kuantitas, pilih metode bayar, dan simpan transaksi secara atomik beserta pengurangan stok.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Product Picker */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Filter */}
          <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#6E2C1B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama produk..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#EAD29C] rounded-xl text-[#3E1004] focus:outline-none focus:ring-2 focus:ring-[#FF8234]"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-[#C7320B] text-white'
                    : 'bg-[#F5E7B8]/70 text-[#6E2C1B] hover:text-[#C7320B]'
                }`}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-[#C7320B] text-white'
                      : 'bg-[#F5E7B8]/70 text-[#6E2C1B] hover:text-[#C7320B]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {activeProducts.length === 0 ? (
            <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-8 text-center text-xs text-[#6E2C1B]">
              Tidak ada produk aktif yang cocok dengan pencarianmu.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {activeProducts.map((product) => {
                const outOfStock = product.quantity_on_hand <= 0;
                const inCart = cart.find((c) => c.product.id === product.id);
                return (
                  <button
                    key={product.id}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => addProductToCart(product)}
                    className={`text-left bg-[#FFFDF5] border rounded-2xl p-3.5 flex gap-3 transition-colors ${
                      outOfStock
                        ? 'border-[#EAD29C]/60 opacity-60 cursor-not-allowed'
                        : inCart
                        ? 'border-[#C7320B] bg-[#FCF6E0] cursor-pointer'
                        : 'border-[#EAD29C] hover:border-[#FF8234] cursor-pointer'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl bg-[#F5E7B8] border border-[#EAD29C] overflow-hidden shrink-0 flex items-center justify-center">
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
                        <span className="font-heading font-black text-lg text-[#C7320B]">
                          {product.name.slice(0, 1)}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <p className="font-heading font-black text-sm text-[#C7320B] truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-[#6E2C1B] truncate">
                          {product.category_name} ·{' '}
                          <span
                            className={`font-mono tabular-nums font-bold ${
                              outOfStock ? 'text-[#DC2626]' : 'text-[#6E2C1B]'
                            }`}
                          >
                            {outOfStock ? 'Stok Habis' : `Stok ${product.quantity_on_hand}`}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1.5">
                        <span className="font-mono tabular-nums font-black text-sm text-[#3E1004]">
                          {formatRupiah(product.price)}
                        </span>
                        {inCart && (
                          <span className="font-mono tabular-nums text-xs font-black text-[#C7320B]">
                            {inCart.quantity} di keranjang
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Checkout Cart */}
        <div className="lg:col-span-5 bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-5 space-y-4 lg:sticky lg:top-20">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAD29C]">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-[#C7320B]" />
              <h2 className="font-heading font-black text-base text-[#C7320B]">
                Keranjang Kasir
              </h2>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={resetCartForNextOrder}
                className="text-xs font-bold text-[#6E2C1B] hover:text-[#DC2626] underline cursor-pointer"
              >
                Kosongkan
              </button>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 text-xs font-semibold text-[#DC2626] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {cart.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#6E2C1B] space-y-1">
              <p className="font-bold text-[#C7320B]">Keranjang masih kosong</p>
              <p>Klik produk di sebelah kiri untuk menambahkan ke pesanan.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#EAD29C]/60 max-h-64 overflow-y-auto pr-1">
              {cart.map((line) => (
                <div key={line.product.id} className="py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#3E1004] truncate">
                      {line.product.name}
                    </p>
                    <p className="text-xs font-mono tabular-nums text-[#6E2C1B]">
                      {formatRupiah(line.product.price)} × {line.quantity} ={' '}
                      <strong className="text-[#C7320B]">
                        {formatRupiah(line.product.price * line.quantity)}
                      </strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center border border-[#EAD29C] rounded-lg bg-[#FCF6E0]">
                      <button
                        type="button"
                        onClick={() => updateLineQty(line.product.id, -1)}
                        className="p-1.5 text-[#C7320B] hover:bg-[#F5E7B8] rounded-l-lg cursor-pointer"
                        aria-label="Kurangi jumlah"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-mono tabular-nums text-xs font-black text-[#3E1004]">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateLineQty(line.product.id, 1)}
                        className="p-1.5 text-[#C7320B] hover:bg-[#F5E7B8] rounded-r-lg cursor-pointer"
                        aria-label="Tambah jumlah"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(line.product.id)}
                      className="p-1.5 text-[#6E2C1B] hover:text-[#DC2626] cursor-pointer"
                      aria-label={`Hapus ${line.product.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Discount & Payment Method */}
          <div className="pt-3 border-t border-[#EAD29C] space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="pos-discount" className="text-xs font-bold text-[#6E2C1B]">
                Diskon (Rp)
              </label>
              <input
                id="pos-discount"
                type="text"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value.replace(/[^0-9]/g, '') || '0')}
                className="w-32 text-right px-2.5 py-1.5 font-mono tabular-nums text-xs font-bold bg-white border border-[#EAD29C] rounded-lg text-[#3E1004] focus:outline-none focus:ring-1 focus:ring-[#FF8234]"
              />
            </div>

            <div>
              <span className="block text-xs font-bold text-[#6E2C1B] mb-1.5">
                Metode Pembayaran
              </span>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F5E7B8]/70 border border-[#EAD29C] rounded-xl">
                {(
                  [
                    { id: 'cash', label: 'Tunai' },
                    { id: 'qris', label: 'QRIS' },
                    { id: 'transfer', label: 'Transfer' },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`py-1.5 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      paymentMethod === m.id
                        ? 'bg-[#C7320B] text-white'
                        : 'text-[#6E2C1B] hover:text-[#C7320B]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-[#6E2C1B]">Status Pembayaran</span>
              <div className="inline-flex p-0.5 bg-[#F5E7B8]/70 border border-[#EAD29C] rounded-lg gap-0.5">
                <button
                  type="button"
                  onClick={() => setPaymentStatus('paid')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md cursor-pointer ${
                    paymentStatus === 'paid'
                      ? 'bg-[#16A34A] text-white'
                      : 'text-[#6E2C1B]'
                  }`}
                >
                  Lunas
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStatus('pending')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md cursor-pointer ${
                    paymentStatus === 'pending'
                      ? 'bg-[#D97706] text-white'
                      : 'text-[#6E2C1B]'
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>
          </div>

          {/* Summary & Checkout CTA */}
          <div className="pt-3 border-t border-[#EAD29C] space-y-2 text-xs">
            <div className="flex justify-between text-[#6E2C1B]">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums font-bold">{formatRupiah(subtotal)}</span>
            </div>
            {parsedDiscount > 0 && (
              <div className="flex justify-between text-[#16A34A]">
                <span>Diskon</span>
                <span className="font-mono tabular-nums font-bold">-{formatRupiah(parsedDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base pt-2 border-t border-[#EAD29C]">
              <span className="font-heading font-black text-[#C7320B]">Grand Total</span>
              <span className="font-mono tabular-nums font-black text-[#C7320B]">
                {formatRupiah(grandTotal)}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting || cart.length === 0}
            onClick={() => void handleCheckout()}
            className="w-full py-3 px-4 bg-[#C7320B] hover:bg-[#A12606] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>{isSubmitting ? 'Menyimpan Transaksi...' : 'Simpan Transaksi'}</span>
          </button>
        </div>
      </div>

      {/* Receipt Confirmation Modal */}
      {receiptTx && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div
            onClick={() => setReceiptTx(null)}
            className="fixed inset-0 bg-[#3E1004]/50 backdrop-blur-xs"
          />
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#EAD29C]">
                <div className="p-2 bg-[#16A34A]/15 text-[#16A34A] rounded-xl">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-black text-[#C7320B]">
                    Transaksi Tersimpan
                  </h3>
                  <p className="font-mono tabular-nums text-xs font-bold text-[#6E2C1B]">
                    {receiptTx.transaction_number}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#6E2C1B]">
                <div className="flex justify-between">
                  <span>Waktu</span>
                  <span className="font-mono tabular-nums text-[#3E1004]">
                    {new Date(receiptTx.created_at).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Metode &amp; Status</span>
                  <span className="uppercase font-bold text-[#3E1004]">
                    {receiptTx.payment_method} · {receiptTx.payment_status === 'paid' ? 'Lunas' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="border-y border-[#EAD29C] py-3 space-y-2">
                {receiptTx.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs gap-2">
                    <span className="text-[#3E1004] font-medium">
                      {item.product_name_snapshot} × {item.quantity}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-[#3E1004]">
                      {formatRupiah(item.line_total)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[#6E2C1B]">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">{formatRupiah(receiptTx.subtotal)}</span>
                </div>
                {receiptTx.discount_total > 0 && (
                  <div className="flex justify-between text-[#16A34A]">
                    <span>Diskon</span>
                    <span className="font-mono tabular-nums">-{formatRupiah(receiptTx.discount_total)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-[#C7320B] pt-1">
                  <span>Grand Total</span>
                  <span className="font-mono tabular-nums">{formatRupiah(receiptTx.grand_total)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReceiptTx(null)}
                className="w-full py-2.5 bg-[#C7320B] hover:bg-[#A12606] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
