import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Settings2, Code2 } from 'lucide-react';
import { Logo } from './Logo';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  onOpenConfig: () => void;
  onOpenVueGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenConfig, onOpenVueGuide }) => {
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <a href="#hero" className="flex items-center group focus:outline-none">
          <Logo size="md" variant="horizontal" />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-[15px] font-semibold text-[#70412E]">
          {navLinks.map(link => (
            <a
              key={link.label}
              href={link.href}
              className="relative text-[#70412E]/90 hover:text-[#70412E] transition-colors py-1 group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#C58B55] transition-all duration-200 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Vue.js Portfolio & Architecture Guide Badge */}
          <button
            onClick={onOpenVueGuide}
            type="button"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#78804B] bg-[#78804B]/10 hover:bg-[#78804B]/20 transition-colors border border-[#78804B]/20"
            title="Lihat Kode & Panduan Migrasi Vue.js 3"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Vue.js 3 Guide</span>
          </button>

          {/* Quick Config Modal Button */}
          <button
            onClick={onOpenConfig}
            type="button"
            className="hidden sm:inline-flex items-center justify-center p-2 text-[#806B58] hover:text-[#70412E] hover:bg-[#F5E6C8]/60 rounded-full transition-colors"
            title="Pengaturan Kontak & WhatsApp"
            aria-label="Pengaturan Toko"
          >
            <Settings2 className="w-5 h-5" />
          </button>

          {/* Cart Trigger Button */}
          <button
            onClick={openCart}
            type="button"
            className="relative inline-flex items-center justify-center p-2.5 sm:px-3.5 sm:py-2 text-[#70412E] bg-[#F5E6C8] hover:bg-[#ebd8b4] rounded-full sm:rounded-xl transition-all duration-200 active:scale-95 border border-[#E8D5B5]"
            aria-label={`Keranjang belanja, ${totalItems} item`}
          >
            <ShoppingBag className="w-5 h-5 text-[#70412E]" />
            <span className="hidden sm:inline font-bold text-xs ml-1.5 text-[#70412E]">
              Keranjang
            </span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 sm:static sm:ml-2 bg-[#70412E] text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                {totalItems}
              </span>
            )}
          </button>

          {/* Primary CTA Button "Pesan Sekarang" */}
          <a
            href="#menu"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-[#FFFAF1] bg-[#70412E] hover:bg-[#5b3222] rounded-xl shadow-sm transition-all duration-200 hover:shadow active:scale-95"
          >
            Pesan Sekarang
          </a>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            type="button"
            className="md:hidden p-2 text-[#70412E] hover:bg-[#F5E6C8] rounded-lg transition-colors ml-1"
            aria-label="Menu navigasi"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFFAF1] border-b border-[#E8D5B5] px-5 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg">
          <div className="flex flex-col space-y-2 pt-1 pb-2">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-base font-bold text-[#70412E] hover:bg-[#F5E6C8]/60 rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E8D5B5]/60 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenVueGuide();
              }}
              type="button"
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#78804B] bg-[#78804B]/10 rounded-lg"
            >
              <Code2 className="w-4 h-4" />
              <span>Lihat Kode & Panduan Vue.js 3</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenConfig();
              }}
              type="button"
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#806B58] bg-[#F5E6C8]/40 rounded-lg"
            >
              <Settings2 className="w-4 h-4" />
              <span>Pengaturan Kontak & WhatsApp Toko</span>
            </button>

            <a
              href="#menu"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-bold text-white bg-[#70412E] rounded-xl shadow-sm"
            >
              Pesan Sekarang
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
