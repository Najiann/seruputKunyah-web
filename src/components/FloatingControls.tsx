import React from 'react';
import { MessageCircle, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { StoreConfig } from '../types';

interface FloatingControlsProps {
  storeConfig: StoreConfig;
}

export const FloatingControls: React.FC<FloatingControlsProps> = ({ storeConfig }) => {
  const { totalItems, openCart, toastMessage } = useCart();

  const waUrl = `https://wa.me/${storeConfig.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    'Halo admin SERUPUT & KUNYAH! Saya mau tanya-tanya tentang menu makaroni dan es teh hari ini...'
  )}`;

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#70412E] text-white px-5 py-3 rounded-2xl shadow-xl border border-[#C58B55] flex items-center gap-2 text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span>{toastMessage}</span>
          <button
            onClick={openCart}
            type="button"
            className="ml-2 underline text-[#F5E6C8] hover:text-white text-xs cursor-pointer"
          >
            Buka Keranjang &rarr;
          </button>
        </div>
      )}

      {/* Floating Action Buttons Container */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 items-end">
        
        {/* Floating Cart (Visible on Mobile & Tablet if items in cart) */}
        {totalItems > 0 && (
          <button
            onClick={openCart}
            type="button"
            className="md:hidden flex items-center gap-2 bg-[#70412E] text-white py-3 px-4 rounded-full shadow-lg border-2 border-[#FFFAF1] hover:scale-105 active:scale-95 transition-all duration-200"
            aria-label="Buka keranjang belanja"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-xs font-black">{totalItems} Item</span>
          </button>
        )}

        {/* Floating WhatsApp Button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center w-14 h-14 bg-[#78804B] hover:bg-[#62693b] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-[#FFFAF1]"
          aria-label="Hubungi WhatsApp SERUPUT & KUNYAH"
        >
          <MessageCircle className="w-7 h-7" />
          
          {/* Tooltip on hover */}
          <span className="absolute right-16 bg-[#70412E] text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden sm:block">
            Chat WhatsApp
          </span>
        </a>

      </div>
    </>
  );
};
