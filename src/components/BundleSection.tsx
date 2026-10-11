import React from 'react';
import { Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { BUNDLE_ITEMS, BUNDLES_ENABLED, PRODUCTS } from '../data/products';
import { formatRupiah } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

export const BundleSection: React.FC = () => {
  const { addToCart } = useCart();

  if (!BUNDLES_ENABLED || BUNDLE_ITEMS.length === 0) {
    return null;
  }

  const handleAddBundle = (bundle: typeof BUNDLE_ITEMS[0]) => {
    // Add as a special bundle product representation into cart
    const bundleProduct: Product = {
      id: bundle.id,
      name: bundle.name,
      category: 'food',
      categoryLabel: 'Paket Kombo',
      description: `${bundle.tagline} — ${bundle.description}`,
      price: bundle.bundlePrice,
      image: bundle.image,
      badge: 'Hemat',
    };
    addToCart(bundleProduct, 1, 'Paket Bundling Kombo');
  };

  return (
    <section id="paket" className="py-16 bg-[#F5E6C8]/40 border-y border-[#E8D5B5]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#78804B] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#C58B55]" />
              <span>Paket Rekomendasi Mahasiswa</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#70412E] tracking-tight">
              Lebih Hemat Bareng Paket Kombo
            </h2>
            <p className="text-sm text-[#806B58] max-w-xl">
              Perpaduan camilan makaroni renyah gurih dan segarnya es teh racikan khas SERUPUT & KUNYAH dengan harga lebih terjangkau.
            </p>
          </div>

          <a
            href="#menu"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#70412E] hover:text-[#C58B55] transition-colors"
          >
            <span>Lihat semua menu satuan</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Bundle Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {BUNDLE_ITEMS.map(bundle => (
            <div
              key={bundle.id}
              className="bg-[#FFFAF1] rounded-2xl border-2 border-[#E8D5B5] p-6 hover:border-[#C58B55] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="bg-[#78804B] text-white text-[11px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {bundle.badge}
                    </span>
                    <h3 className="font-heading text-xl sm:text-2xl font-black text-[#70412E] mt-2">
                      {bundle.name}
                    </h3>
                    <p className="text-xs font-bold text-[#C58B55] uppercase tracking-wide">
                      {bundle.tagline}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="block text-xs line-through text-[#806B58]">
                      {formatRupiah(bundle.originalPrice)}
                    </span>
                    <span className="font-heading text-2xl font-black text-[#70412E]">
                      {formatRupiah(bundle.bundlePrice)}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[#806B58] leading-relaxed">
                  {bundle.description}
                </p>

                {/* What's included checklist */}
                <div className="bg-[#F5E6C8]/40 p-3.5 rounded-xl border border-[#E8D5B5]/60">
                  <p className="text-[11px] font-bold text-[#70412E] uppercase tracking-wider mb-2">
                    Termasuk dalam paket:
                  </p>
                  <ul className="space-y-1.5 text-xs text-[#70412E] font-medium">
                    {bundle.productsIncluded.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#78804B]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <button
                  onClick={() => handleAddBundle(bundle)}
                  type="button"
                  className="w-full py-3 px-4 bg-[#70412E] hover:bg-[#583020] text-white font-bold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xs active:scale-95"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Pesan Paket Ini ({formatRupiah(bundle.bundlePrice)})</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
