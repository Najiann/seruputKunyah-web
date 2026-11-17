import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { useCart } from '../context/CartContext';
import { BUNDLES_ENABLED } from '../data/products';

interface NavbarProps {
  onOpenConfig?: () => void;
  onOpenVueGuide?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { totalItems, openCart } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Beranda', href: '#hero' },
    { label: 'Menu', href: '#menu' },
    ...(BUNDLES_ENABLED ? [{ label: 'Paket Kombo', href: '#paket' }] : []),
    { label: 'Tentang Kami', href: '#tentang' },
    { label: 'Cara Pesan', href: '#cara-pesan' },
    { label: 'Ulasan', href: '#ulasan' },
    { label: 'Kontak', href: '#kontak' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FCF6E0]/95 backdrop-blur-md shadow-sm border-b border-[#EAD29C]/60 py-3'
          : 'bg-[#FCF6E0] py-4 sm:py-5 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name (Airy & Non-crowding) */}
        <a href="#hero" className="flex items-center group focus:outline-none shrink-0">
          <Logo size="md" variant="horizontal" />
        </a>

        {/* Desktop Navigation Links (Spacious with generous gap, cleanly hidden on <1024px) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-bold text-[#C7320B]">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="relative text-[#C7320B]/85 hover:text-[#C7320B] transition-colors py-1 group whitespace-nowrap"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FF8234] transition-all duration-200 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Cart Trigger Button */}
          <button
            onClick={openCart}
            type="button"
            className="relative inline-flex items-center justify-center p-2.5 sm:px-3.5 sm:py-2 text-[#C7320B] bg-[#F5E7B8] hover:bg-[#EFE0B0] rounded-xl transition-all duration-200 active:scale-95 border border-[#EAD29C] cursor-pointer"
            aria-label={`Keranjang belanja, ${totalItems} item`}
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#C7320B]" />
            <span className="hidden sm:inline font-bold text-xs ml-1.5 text-[#C7320B]">
              Keranjang
            </span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 sm:static sm:ml-2 bg-[#C7320B] text-white text-[10px] sm:text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {totalItems}
              </span>
            )}
          </button>

          {/* Primary CTA Button "Pesan Sekarang" */}
          <a
            href="#menu"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-bold text-[#FCF6E0] bg-[#C7320B] hover:bg-[#A12606] rounded-xl shadow-xs transition-all duration-200 hover:shadow active:scale-95 whitespace-nowrap"
          >
            Pesan Sekarang
          </a>

          {/* Mobile Menu Hamburger (Visible on <1024px) */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            type="button"
            className="lg:hidden p-2 text-[#C7320B] hover:bg-[#F5E7B8] rounded-xl transition-colors ml-0.5 cursor-pointer"
            aria-label="Menu navigasi"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FCF6E0] border-b border-[#EAD29C] px-5 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg">
          <div className="flex flex-col space-y-1.5 pt-1 pb-2">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm sm:text-base font-bold text-[#C7320B] hover:bg-[#F5E7B8]/60 rounded-xl transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-2 border-t border-[#EAD29C]/60 flex flex-col gap-2">
            <a
              href="#menu"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-xs sm:text-sm font-bold text-white bg-[#C7320B] rounded-xl shadow-xs"
            >
              Pesan Sekarang
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
