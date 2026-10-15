import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { Logo } from './Logo';
import { useCart } from '../context/CartContext';

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
    { label: 'Paket Kombo', href: '#paket' },
    { label: 'Tentang Kami', href: '#tentang' },
    { label: 'Cara Pesan', href: '#cara-pesan' },
    { label: 'Ulasan', href: '#ulasan' },
    { label: 'Kontak', href: '#kontak' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FFFAF1]/95 backdrop-blur-md shadow-sm border-b border-[#E8D5B5]/60 py-3'
          : 'bg-[#FFFAF1] py-4 sm:py-5 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name (Airy & Non-crowding) */}
        <a href="#hero" className="flex items-center group focus:outline-none shrink-0">
          <Logo size="md" variant="horizontal" />
        </a>

        {/* Desktop Navigation Links (Spacious with generous gap, cleanly hidden on <1024px) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-bold text-[#70412E]">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="relative text-[#70412E]/85 hover:text-[#70412E] transition-colors py-1 group whitespace-nowrap"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#C58B55] transition-all duration-200 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Cart Trigger Button */}
          <button
            onClick={openCart}
            type="button"
            className="relative inline-flex items-center justify-center p-2.5 sm:px-3.5 sm:py-2 text-[#70412E] bg-[#F5E6C8] hover:bg-[#ebd8b4] rounded-xl transition-all duration-200 active:scale-95 border border-[#E8D5B5] cursor-pointer"
            aria-label={`Keranjang belanja, ${totalItems} item`}
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#70412E]" />
            <span className="hidden sm:inline font-bold text-xs ml-1.5 text-[#70412E]">
              Keranjang
            </span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 sm:static sm:ml-2 bg-[#70412E] text-white text-[10px] sm:text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {totalItems}
              </span>
            )}
          </button>

          {/* Primary CTA Button "Pesan Sekarang" */}
          <a
            href="#menu"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-bold text-[#FFFAF1] bg-[#70412E] hover:bg-[#5b3222] rounded-xl shadow-xs transition-all duration-200 hover:shadow active:scale-95 whitespace-nowrap"
          >
            Pesan Sekarang
          </a>

          {/* Mobile Menu Hamburger (Visible on <1024px) */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            type="button"
            className="lg:hidden p-2 text-[#70412E] hover:bg-[#F5E6C8] rounded-xl transition-colors ml-0.5 cursor-pointer"
            aria-label="Menu navigasi"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FFFAF1] border-b border-[#E8D5B5] px-5 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg">
          <div className="flex flex-col space-y-1.5 pt-1 pb-2">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm sm:text-base font-bold text-[#70412E] hover:bg-[#F5E6C8]/60 rounded-xl transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E8D5B5]/60 flex flex-col gap-2">
            <a
              href="#menu"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-xs sm:text-sm font-bold text-white bg-[#70412E] rounded-xl shadow-xs"
            >
              Pesan Sekarang
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
