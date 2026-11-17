import React from 'react';
import { Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { BUNDLES_ENABLED } from '../data/products';
import { formatRupiah } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { Product, BundleItem } from '../types';

export const BundleSection: React.FC = () => {
  const { bundles } = useProducts();
  const { addToCart } = useCart();

  if (!BUNDLES_ENABLED || !bundles || bundles.length === 0) {
    return null;
  }

  const handleAddBundle = (bundle: BundleItem) => {
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
    <section id="paket" className="py-16 bg-[#F5E7B8]/40 border-y border-[#EAD29C]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C7320B] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#FF8234]" />
              <span>Paket Rekomendasi Mahasiswa</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#C7320B] tracking-tight">
              Lebih Hemat Bareng Paket Kombo
            </h2>
            <p className="text-sm text-[#6E2C1B] max-w-xl">
              Perpaduan camilan makaroni renyah gurih dan segarnya es teh racikan khas SERUPUT & KUNYAH dengan harga lebih terjangkau.
            </p>
          </div>

          <a
            href="#menu"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#C7320B] hover:text-[#FF8234] transition-colors"
          >
            <span>Lihat semua menu satuan</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Bundle Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {bundles.map(bundle => (
            <div
              key={bundle.id}
              className="bg-[#FFFDF5] rounded-2xl border-2 border-[#EAD29C] p-6 hover:border-[#FF8234] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="bg-[#FF8234] text-[#3E1004] text-[11px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {bundle.badge}
                    </span>
                    <h3 className="font-heading text-xl sm:text-2xl font-black text-[#C7320B] mt-2">
                      {bundle.name}
                    </h3>
                    <p className="text-xs font-bold text-[#FF8234] uppercase tracking-wide">
                      {bundle.tagline}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="block text-xs line-through text-[#6E2C1B]">
                      {formatRupiah(bundle.originalPrice)}
                    </span>
                    <span className="font-heading text-2xl font-black text-[#C7320B]">
                      {formatRupiah(bundle.bundlePrice)}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-[#6E2C1B] leading-relaxed">
                  {bundle.description}
                </p>

                {/* What's included checklist */}
                <div className="bg-[#F5E7B8]/40 p-3.5 rounded-xl border border-[#EAD29C]/60">
                  <p className="text-[11px] font-bold text-[#C7320B] uppercase tracking-wider mb-2">
                    Termasuk dalam paket:
                  </p>
                  <ul className="space-y-1.5 text-xs text-[#C7320B] font-medium">
                    {bundle.productsIncluded.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF8234]" />
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
                  className="w-full py-3 px-4 bg-[#C7320B] hover:bg-[#A12606] text-white font-bold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xs active:scale-95"
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
