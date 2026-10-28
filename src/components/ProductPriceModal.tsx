import React, { useState } from 'react';
import { X, Save, RotateCcw, Check, Sparkles, Utensils, Coffee, AlertCircle } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { formatRupiah } from '../utils/currency';

interface ProductPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductPriceModal: React.FC<ProductPriceModalProps> = ({ isOpen, onClose }) => {
  const { products, bundles, updateProductPrice, resetToDefault } = useProducts();
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({});
  const [isSaved, setIsSaved] = useState(false);

  // Sync state whenever modal is opened
  React.useEffect(() => {
    if (isOpen) {
      const initial: Record<string, number> = {};
      products.forEach(p => {
        initial[p.id] = p.price;
      });
      setEditedPrices(initial);
      setIsSaved(false);
    }
  }, [isOpen, products]);

  if (!isOpen) return null;

  const handlePriceChange = (productId: string, val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
    setEditedPrices(prev => ({
      ...prev,
      [productId]: isNaN(num) ? 0 : num,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    Object.entries(editedPrices).forEach(([id, price]) => {
      updateProductPrice(id, price);
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    if (window.confirm('Reset seluruh harga kembali ke harga awal default?')) {
      resetToDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#70412E]/50 backdrop-blur-xs transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative bg-[#FFFAF1] border-2 border-[#E8D5B5] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E8D5B5]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#78804B] text-white rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-black text-[#70412E]">
                  Modul Harga Produk Terpusat
                </h3>
                <p className="text-xs text-[#806B58] mt-0.5">
                  Single Source of Truth — Ganti di sini, semua fitur otomatis ikut!
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 text-[#806B58] hover:text-[#70412E] rounded-full hover:bg-[#F5E6C8]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-5 space-y-4">
            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              <p className="text-[11px] font-bold text-[#806B58] uppercase tracking-wider">
                Daftar Menu &amp; Harga Satuan:
              </p>

              {products.map(product => {
                const currentVal = editedPrices[product.id] ?? product.price;
                return (
                  <div
                    key={product.id}
                    className="p-3.5 bg-white border border-[#E8D5B5] rounded-2xl flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F5E6C8] flex items-center justify-center text-[#70412E] shrink-0 font-bold">
                        {product.category === 'food' ? (
                          <Utensils className="w-4 h-4 text-[#C58B55]" />
                        ) : (
                          <Coffee className="w-4 h-4 text-[#78804B]" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-heading font-black text-sm text-[#70412E]">
                          {product.name}
                        </h4>
                        <span className="text-[11px] font-semibold text-[#806B58]">
                          {product.categoryLabel}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#806B58]">Rp</span>
                      <input
                        type="text"
                        value={currentVal.toLocaleString('id-ID')}
                        onChange={e => handlePriceChange(product.id, e.target.value)}
                        className="w-24 text-right px-2.5 py-1.5 text-sm font-black text-[#70412E] bg-[#FFFAF1] border border-[#E8D5B5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#78804B]"
                      />
                    </div>
                  </div>
                );
              })}

              {/* Dynamic Bundling Simulation Preview */}
              <div className="p-3 bg-[#F5E6C8]/40 border border-[#E8D5B5] rounded-2xl space-y-2 mt-4">
                <p className="text-[11px] font-black text-[#70412E] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C58B55]" />
                  <span>Kalkulasi Otomatis Paket Kombo:</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {bundles.map(b => (
                    <div key={b.id} className="p-2 bg-white/70 rounded-xl border border-[#E8D5B5]/60">
                      <p className="font-bold text-[#70412E] truncate">{b.name}</p>
                      <p className="text-[11px] text-[#78804B] font-black mt-0.5">
                        {formatRupiah(b.bundlePrice)}{' '}
                        <span className="line-through text-[#806B58] text-[9px] font-normal">
                          {formatRupiah(b.originalPrice)}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E8D5B5]">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#806B58] hover:text-[#70412E] rounded-xl hover:bg-[#F5E6C8]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Default</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-[#806B58] hover:text-[#70412E] rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaved}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#78804B] hover:bg-[#646b3e] text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95"
                >
                  {isSaved ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Tersimpan &amp; Sinkron!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Simpan &amp; Terapkan</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
