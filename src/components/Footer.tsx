import React from 'react';
import { Logo } from './Logo';
import { MessageCircle, Instagram, Heart, ArrowUp } from 'lucide-react';
import { StoreConfig } from '../types';

interface FooterProps {
  storeConfig: StoreConfig;
  onTriggerSecretDev?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ storeConfig, onTriggerSecretDev }) => {
  const [clickCount, setClickCount] = React.useState(0);
  const clickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleCopyrightClick = () => {
    if (!onTriggerSecretDev) return;
    setClickCount(prev => {
      const next = prev + 1;
      if (next >= 5) {
        onTriggerSecretDev();
        return 0;
      }
      return next;
    });

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 2500);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Beranda', href: '#hero' },
    { label: 'Menu Makanan & Minuman', href: '#menu' },
    { label: 'Paket Kombo', href: '#paket' },
    { label: 'Tentang Usaha', href: '#tentang' },
    { label: 'Cara Pemesanan', href: '#cara-pesan' },
    { label: 'Kontak Admin', href: '#kontak' },
  ];

  return (
    <footer className="bg-[#F5E6C8] border-t-2 border-[#E8D5B5] text-[#70412E] pt-14 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-[#E8D5B5]">
          
          {/* Brand Info & Tagline */}
          <div className="md:col-span-5 space-y-4">
            <Logo size="md" variant="horizontal" />
            
            <p className="text-xs sm:text-sm text-[#806B58] max-w-sm leading-relaxed">
              Usaha kuliner mahasiswa yang menyajikan camilan makaroni gurih renyah dan minuman es teh segar berkualitas dengan harga bersahabat.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${storeConfig.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#FFFAF1] border border-[#E8D5B5] text-[#70412E] hover:bg-[#70412E] hover:text-white flex items-center justify-center transition-colors shadow-2xs"
                aria-label="WhatsApp SERUPUT & KUNYAH"
              >
                <MessageCircle className="w-4 h-4" />
              </a>

              <a
                href={storeConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-[#FFFAF1] border border-[#E8D5B5] text-[#70412E] hover:bg-[#70412E] hover:text-white flex items-center justify-center transition-colors shadow-2xs"
                aria-label="Instagram SERUPUT & KUNYAH"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-heading font-black text-sm uppercase tracking-wider text-[#70412E]">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {navLinks.map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[#806B58] hover:text-[#70412E] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Notes & Student Entrepreneurship project badge */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-heading font-black text-sm uppercase tracking-wider text-[#70412E]">
              Kewirausahaan Mahasiswa
            </h4>
            <p className="text-xs text-[#806B58] leading-relaxed">
              Proyek rintisan kuliner digital kampus. Pengolahan home-based dengan standar kebersihan terjaga.
            </p>
            <div className="pt-2">
              <button
                onClick={scrollToTop}
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#70412E] hover:text-[#C58B55] transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Kembali ke Atas</span>
              </button>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#806B58] gap-3 border-t border-[#E8D5B5]/60 mt-2">
          <p
            onClick={handleCopyrightClick}
            className="cursor-default select-none transition-colors"
            title=""
          >
            &copy; {new Date().getFullYear()} <strong>SERUPUT &amp; KUNYAH</strong>. All rights reserved.
          </p>

          <p className="flex items-center gap-1 select-none">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 text-[#C58B55] fill-[#C58B55]" />
            <span>untuk Tugas Matkul Kewirausahaan</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
