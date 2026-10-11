import React, { useState, useMemo } from 'react';
import { Utensils, Coffee, Sparkles } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { ProductCategory } from '../types';
import { ProductCard } from './ProductCard';

export const ProductSection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all');

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return PRODUCTS;
    return PRODUCTS.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  const categories: Array<{ id: ProductCategory; label: string; icon: React.ReactNode }> = [
    { id: 'all', label: 'Semua Menu', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'food', label: 'Makanan (Makaroni)', icon: <Utensils className="w-4 h-4" /> },
    { id: 'drink', label: 'Minuman (Es Teh)', icon: <Coffee className="w-4 h-4" /> },
  ];

  return (
    <section id="menu" className="py-16 sm:py-24 bg-[#FFFAF1] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <p className="text-xs font-bold text-[#78804B] uppercase tracking-widest">
            Katalog Kuliner Pilihan
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#70412E] tracking-tight">
            Temukan Menu Favoritmu
          </h2>
          <p className="text-sm sm:text-base text-[#806B58] font-medium leading-relaxed">
            Teman terbaik untuk menemani waktu santai, belajar, dan berkumpul. Diracik hangat dengan bumbu gurih dan kesegaran es teh alami.
          </p>
        </div>

        {/* Interactive Category Filter Tabs */}
        <div className="flex items-center justify-center mb-10">
          <div className="inline-flex p-1.5 rounded-2xl bg-[#F5E6C8]/60 border border-[#E8D5B5] shadow-xs gap-1">
            {categories.map(cat => {
              const count = cat.id === 'all' 
                ? PRODUCTS.length 
                : PRODUCTS.filter(p => p.category === cat.id).length;
              const isActive = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#70412E] text-[#FFFAF1] shadow-xs'
                      : 'text-[#70412E] hover:bg-[#F5E6C8] hover:text-[#583020]'
                  }`}
                  aria-pressed={isActive}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                  <span
                    className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-black ${
                      isActive ? 'bg-[#FFFAF1]/20 text-white' : 'bg-[#E8D5B5] text-[#70412E]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Bottom Editorial Note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-[#806B58] inline-flex items-center gap-2 px-4 py-2 bg-[#F5E6C8]/40 border border-[#E8D5B5] rounded-full">
            <span>💡 <strong>Tips Santai:</strong> Pesan makaroni kering & basah bareng es teh lemon untuk perpaduan gurih pedas & asam manis yang paling segar!</span>
          </p>
        </div>

      </div>
    </section>
  );
};
