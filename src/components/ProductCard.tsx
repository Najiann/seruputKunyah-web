import React, { useState } from 'react';
import { Plus, Check, Flame, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { formatRupiah } from '../utils/currency';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<string>(
    product.spicyOptions ? product.spicyOptions[1] || product.spicyOptions[0] : ''
  );
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, 1, selectedVariant);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1200);
  };

  return (
    <article className="group bg-[#FFFAF1] rounded-2xl border border-[#E8D5B5] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full hover:border-[#C58B55]/70">
      {/* Product Image Frame */}
      <div className="relative aspect-4/3 overflow-hidden bg-[#F5E6C8]/50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          width={400}
          height={300}
        />

        {/* Category & Badge Overlay */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="bg-[#FFFAF1]/95 text-[#70412E] text-[11px] font-bold px-2.5 py-1 rounded-md border border-[#E8D5B5] shadow-xs">
            {product.categoryLabel}
          </span>
          {product.badge && (
            <span className="bg-[#70412E] text-[#FFFAF1] text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
              {product.badge}
            </span>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div className="space-y-2">
          {/* Product Title & Price */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-heading text-lg sm:text-xl font-black text-[#70412E] group-hover:text-[#C58B55] transition-colors leading-snug">
              {product.name}
            </h3>
            <span className="font-heading font-black text-lg text-[#70412E] whitespace-nowrap">
              {formatRupiah(product.price)}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-[#806B58] line-clamp-2 leading-relaxed font-normal">
            {product.description}
          </p>

          {/* Option/Variant Selector if applicable (Spiciness / Sweetness) */}
          {product.spicyOptions && product.spicyOptions.length > 0 && (
            <div className="pt-2">
              <label htmlFor={`variant-${product.id}`} className="block text-[11px] font-bold text-[#806B58] uppercase tracking-wider mb-1">
                {product.category === 'food' ? 'Pilihan Tingkat Rasa:' : 'Tingkat Manis:'}
              </label>
              <select
                id={`variant-${product.id}`}
                value={selectedVariant}
                onChange={e => setSelectedVariant(e.target.value)}
                className="w-full text-xs font-semibold py-1.5 px-2.5 bg-[#F5E6C8]/40 border border-[#E8D5B5] rounded-lg text-[#70412E] focus:outline-none focus:ring-1 focus:ring-[#C58B55]"
              >
                {product.spicyOptions.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-5 mt-auto">
          <button
            onClick={handleAdd}
            type="button"
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-xs active:scale-95 ${
              isAdded
                ? 'bg-[#78804B] text-white'
                : 'bg-[#70412E] hover:bg-[#583020] text-white hover:shadow'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Berhasil Ditambahkan!</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Tambah ke Keranjang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
