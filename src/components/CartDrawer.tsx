import React, { useEffect, useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Send, AlertCircle, ArrowLeft, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatRupiah } from '../utils/currency';
import { getWhatsAppOrderUrl } from '../utils/whatsapp';
import { StoreConfig } from '../types';

interface CartDrawerProps {
  storeConfig: StoreConfig;
  onOpenConfig: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ storeConfig, onOpenConfig }) => {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
    customerName,
    setCustomerName,
    customerNote,
    setCustomerNote,
  } = useCart();

  const [nameError, setNameError] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    if (items.length === 0) return;

    if (!customerName || !customerName.trim()) {
      setNameError(true);
      const nameInput = document.getElementById('customer-order-name');
      if (nameInput) {
        nameInput.focus();
      }
      return;
    }

    setNameError(false);
    const checkoutUrl = getWhatsAppOrderUrl(
      storeConfig.whatsappNumber,
      items,
      customerNote,
      customerName
    );
    // Open WhatsApp Click to Chat in new tab
    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
  };

  const isConfigPlaceholder = storeConfig.whatsappNumber === '6281234567890';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Keranjang Pesanan">
      {/* Dimmed Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-[#70412E]/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FFFAF1] shadow-2xl flex flex-col border-l border-[#E8D5B5] animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-[#E8D5B5] flex items-center justify-between bg-[#F5E6C8]/40">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#70412E] text-white rounded-xl shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading text-lg sm:text-xl font-black text-[#70412E]">
                  Keranjang Pesanan
                </h2>
                <p className="text-xs font-semibold text-[#806B58]">
                  {totalItems > 0 ? `${totalItems} item dipilih` : 'Belum ada item'}
                </p>
              </div>
            </div>

            <button
              onClick={closeCart}
              type="button"
              className="p-2 text-[#70412E] hover:bg-[#E8D5B5]/60 rounded-full transition-colors"
              aria-label="Tutup keranjang"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Config banner note if WhatsApp is default placeholder */}
          {isConfigPlaceholder && (
            <div className="bg-[#C58B55]/15 border-b border-[#C58B55]/30 px-4 py-2.5 flex items-center justify-between text-xs text-[#70412E]">
              <div className="flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-4 h-4 text-[#C58B55] shrink-0" />
                <span>Nomor WA pengembang masih placeholder.</span>
              </div>
              <button
                onClick={onOpenConfig}
                type="button"
                className="font-bold underline text-[#70412E] hover:text-[#583020] ml-2"
              >
                Ubah
              </button>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {items.length === 0 ? (
              // Empty State
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
                <div className="w-20 h-20 rounded-full bg-[#F5E6C8] flex items-center justify-center text-[#70412E] border-2 border-[#E8D5B5]">
                  <ShoppingBag className="w-9 h-9 stroke-[1.5]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-heading text-lg font-bold text-[#70412E]">
                    Keranjangmu Masih Kosong
                  </h3>
                  <p className="text-xs sm:text-sm text-[#806B58] max-w-xs">
                    Yuk pilih makaroni gurih atau es teh segar favoritmu untuk mulai memesan!
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  type="button"
                  className="px-6 py-2.5 bg-[#70412E] text-white text-xs font-bold rounded-xl hover:bg-[#583020] transition-colors shadow-xs"
                >
                  Lihat Katalog Menu
                </button>
              </div>
            ) : (
              // Item List
              <div className="space-y-3.5">
                {items.map(item => {
                  const subtotal = item.product.price * item.quantity;
                  return (
                    <div
                      key={item.product.id}
                      className="bg-white rounded-xl border border-[#E8D5B5] p-3.5 flex gap-3 shadow-2xs items-start"
                    >
                      {/* Product Thumbnail */}
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-lg object-cover border border-[#E8D5B5] shrink-0"
                      />

                      {/* Detail & Controls */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-heading font-black text-sm text-[#70412E] truncate">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            type="button"
                            className="text-[#806B58] hover:text-red-600 transition-colors p-1"
                            title="Hapus produk"
                            aria-label={`Hapus ${item.product.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {item.notes && (
                          <p className="text-[11px] font-semibold text-[#78804B] truncate">
                            {item.notes}
                          </p>
                        )}

                        <p className="text-xs font-medium text-[#806B58] mt-0.5">
                          {formatRupiah(item.product.price)} / porsi
                        </p>

                        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100">
                          {/* Quantity selector */}
                          <div className="flex items-center border border-[#E8D5B5] rounded-lg bg-[#FFFAF1]">
                            <button
                              onClick={() => updateQuantity(item.product.id, -1)}
                              type="button"
                              className="p-1 hover:bg-[#F5E6C8] text-[#70412E] rounded-l-lg transition-colors"
                              aria-label="Kurangi kuantitas"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-black text-[#70412E]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, 1)}
                              type="button"
                              className="p-1 hover:bg-[#F5E6C8] text-[#70412E] rounded-r-lg transition-colors"
                              aria-label="Tambah kuantitas"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Subtotal */}
                          <span className="font-heading font-black text-sm text-[#70412E]">
                            {formatRupiah(subtotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Optional Clear Cart button */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={clearCart}
                    type="button"
                    className="text-xs text-[#806B58] hover:text-red-600 underline font-semibold transition-colors"
                  >
                    Kosongkan Keranjang
                  </button>
                </div>
              </div>
            )}

            {/* Customer Name & Notes Input */}
            {items.length > 0 && (
              <div className="pt-3 border-t border-[#E8D5B5]/60 space-y-3">
                {/* Input Nama Pemesan */}
                <div>
                  <label
                    htmlFor="customer-order-name"
                    className="block text-xs font-bold text-[#70412E] mb-1.5 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#C58B55]" />
                      <span>Nama Pemesan / Atas Nama:</span>
                    </span>
                    <span className="text-[11px] font-bold text-[#78804B]">*Wajib diisi</span>
                  </label>
                  <input
                    id="customer-order-name"
                    type="text"
                    value={customerName}
                    onChange={e => {
                      setCustomerName(e.target.value);
                      if (nameError && e.target.value.trim()) setNameError(false);
                    }}
                    placeholder="Contoh: Jihan / Kak Dimas"
                    className={`w-full text-xs p-2.5 rounded-xl border bg-white focus:outline-none transition-all text-[#70412E] placeholder:text-[#806B58]/50 ${
                      nameError
                        ? 'border-red-500 ring-2 ring-red-200'
                        : 'border-[#E8D5B5] focus:ring-1 focus:ring-[#C58B55]'
                    }`}
                  />
                  {nameError && (
                    <p className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>Mohon isi nama pemesan sebelum mengirim pesanan ke WhatsApp.</span>
                    </p>
                  )}
                </div>

                {/* Catatan Tambahan */}
                <div>
                  <label
                    htmlFor="customer-order-note"
                    className="block text-xs font-bold text-[#70412E] mb-1.5"
                  >
                    Catatan Pesanan (Opsional):
                  </label>
                  <textarea
                    id="customer-order-note"
                    rows={2}
                    value={customerNote}
                    onChange={e => setCustomerNote(e.target.value)}
                    placeholder="Contoh: Makaroni basah pedas level 2, es teh jangan terlalu manis, ambil di kantin kampus..."
                    className="w-full text-xs p-2.5 rounded-xl border border-[#E8D5B5] bg-white focus:outline-none focus:ring-1 focus:ring-[#C58B55] text-[#70412E] placeholder:text-[#806B58]/50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-[#E8D5B5] bg-[#F5E6C8]/40 space-y-3.5">
              {/* Price Calculation breakdown */}
              <div className="space-y-1.5 text-xs text-[#806B58]">
                <div className="flex justify-between">
                  <span>Jumlah Item:</span>
                  <span className="font-bold text-[#70412E]">{totalItems} porsi</span>
                </div>
                <div className="flex justify-between text-sm pt-1 border-t border-[#E8D5B5]">
                  <span className="font-heading font-black text-[#70412E]">Total Sementara:</span>
                  <span className="font-heading font-black text-lg text-[#70412E]">
                    {formatRupiah(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Informational clarification */}
              <p className="text-[11px] text-[#806B58] leading-tight">
                * Konfirmasi ketersediaan, titik temu/ongkir, dan pembayaran dilakukan via chat WhatsApp tim kami.
              </p>

              {/* WhatsApp Checkout Button */}
              <button
                onClick={handleCheckout}
                type="button"
                className="w-full py-3.5 px-4 bg-[#70412E] hover:bg-[#583020] text-white font-bold text-sm rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Checkout via WhatsApp</span>
              </button>

              {/* Return to shop */}
              <button
                onClick={closeCart}
                type="button"
                className="w-full py-2 text-xs font-bold text-[#70412E] hover:text-[#C58B55] transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Lanjut Pilih Menu Lain</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
