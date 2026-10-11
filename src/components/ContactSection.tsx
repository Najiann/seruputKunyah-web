import React from 'react';
import { MessageCircle, Instagram, MapPin, Clock } from 'lucide-react';
import { StoreConfig } from '../types';

interface ContactSectionProps {
  storeConfig: StoreConfig;
  onOpenConfig?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  storeConfig,
}) => {
  return (
    <section id="kontak" className="py-16 sm:py-24 bg-[#FFFAF1] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <p className="text-xs font-bold text-[#78804B] uppercase tracking-wider">
            Hubungi Kami
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#70412E] tracking-tight">
            Kontak &amp; Area Pelayanan
          </h2>
          <p className="text-sm text-[#806B58]">
            Kami siap melayani pesanan camilan dan minuman untuk kamu yang berada di lingkungan kampus dan sekitarnya.
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: WhatsApp */}
          <div className="bg-[#FFFAF1] border-2 border-[#E8D5B5] rounded-2xl p-6 flex flex-col justify-between hover:border-[#C58B55] transition-all duration-200">
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#78804B]/15 text-[#78804B] flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-black text-lg text-[#70412E] mb-1">
                WhatsApp Pesanan
              </h3>
              <p className="text-xs text-[#806B58] mb-3">
                Jalur utama pemesanan online dan tanya ketersediaan stok hari ini.
              </p>
              <p className="text-sm font-bold text-[#70412E] font-mono break-all">
                {storeConfig.whatsappDisplay}
              </p>
            </div>

            <div className="pt-4 mt-2">
              <a
                href={`https://wa.me/${storeConfig.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#70412E] hover:bg-[#583020] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                <span>Chat Admin WA</span>
              </a>
            </div>
          </div>

          {/* Card 2: Instagram */}
          <div className="bg-[#FFFAF1] border-2 border-[#E8D5B5] rounded-2xl p-6 flex flex-col justify-between hover:border-[#C58B55] transition-all duration-200">
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#C58B55]/15 text-[#C58B55] flex items-center justify-center mb-4">
                <Instagram className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-black text-lg text-[#70412E] mb-1">
                Media Sosial
              </h3>
              <p className="text-xs text-[#806B58] mb-3">
                Ikuti info open-order harian, giveaway, dan update menu terbaru.
              </p>
              <p className="text-sm font-bold text-[#70412E]">
                {storeConfig.instagramHandle}
              </p>
            </div>

            <div className="pt-4 mt-2">
              <a
                href={storeConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#F5E6C8] hover:bg-[#ebd3a8] text-[#70412E] text-xs font-bold rounded-xl border border-[#E8D5B5] transition-colors"
              >
                <span>Kunjungi Instagram</span>
              </a>
            </div>
          </div>

          {/* Card 3: Area Pelayanan */}
          <div className="bg-[#FFFAF1] border-2 border-[#E8D5B5] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#70412E]/10 text-[#70412E] flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-black text-lg text-[#70412E] mb-1">
                Area Pelayanan
              </h3>
              <p className="text-xs text-[#806B58] mb-3">
                Jangkauan antar dan titik temu pemesanan untuk pelanggan.
              </p>
              <p className="text-sm font-semibold text-[#70412E]">
                {storeConfig.campusArea}
              </p>
            </div>

            <div className="pt-4 mt-2 text-[11px] text-[#806B58] italic">
              *Titik temu fleksibel di fakultas atau kosan terdekat.
            </div>
          </div>

          {/* Card 4: Jam Operasional */}
          <div className="bg-[#FFFAF1] border-2 border-[#E8D5B5] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#78804B]/15 text-[#78804B] flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-black text-lg text-[#70412E] mb-1">
                Waktu Operasional
              </h3>
              <p className="text-xs text-[#806B58] mb-3">
                Jadwal produksi fresh dan jam fast-response chat pesanan.
              </p>
              <p className="text-sm font-semibold text-[#70412E]">
                {storeConfig.operationalHours}
              </p>
            </div>

            <div className="pt-4 mt-2 text-[11px] text-[#78804B] font-semibold">
              *Pesanan diproses fresh setiap hari untuk menjaga kualitas rasa.
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
