import React, { useState } from 'react';
import { MessageCircle, Instagram, MapPin, Clock, Navigation } from 'lucide-react';
import { StoreConfig } from '../types';
import { StoreLocationMap, buildExternalMapsUrl } from './StoreLocationMap';

interface ContactSectionProps {
  storeConfig: StoreConfig;
  onOpenConfig?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  storeConfig,
}) => {
  const [resolvedPlaceUri, setResolvedPlaceUri] = useState<string | null>(null);
  const mapsDirectionsUrl = buildExternalMapsUrl(storeConfig, resolvedPlaceUri);

  return (
    <section id="kontak" className="py-16 sm:py-24 bg-[#FCF6E0] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <p className="text-xs font-bold text-[#C7320B] uppercase tracking-wider">
            Hubungi Kami
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#C7320B] tracking-tight">
            Kontak &amp; Lokasi Kami
          </h2>
          <p className="text-sm text-[#6E2C1B]">
            Kunjungi titik lokasi kami di Pasar Minggu atau hubungi admin untuk pemesanan online area kampus dan sekitarnya.
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: WhatsApp */}
          <div className="bg-[#FCF6E0] border-2 border-[#EAD29C] rounded-2xl p-6 flex flex-col justify-between hover:border-[#FF8234] transition-all duration-200">
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#C7320B]/15 text-[#C7320B] flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-black text-lg text-[#C7320B] mb-1">
                WhatsApp Pesanan
              </h3>
              <p className="text-xs text-[#6E2C1B] mb-3">
                Jalur utama pemesanan online dan tanya ketersediaan stok hari ini.
              </p>
              <p className="text-sm font-bold text-[#C7320B] font-mono break-all">
                {storeConfig.whatsappDisplay}
              </p>
            </div>

            <div className="pt-4 mt-2">
              <a
                href={`https://wa.me/${storeConfig.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#C7320B] hover:bg-[#A12606] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                <span>Chat Admin WA</span>
              </a>
            </div>
          </div>

          {/* Card 2: Instagram */}
          <div className="bg-[#FCF6E0] border-2 border-[#EAD29C] rounded-2xl p-6 flex flex-col justify-between hover:border-[#FF8234] transition-all duration-200">
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#FF8234]/15 text-[#FF8234] flex items-center justify-center mb-4">
                <Instagram className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-black text-lg text-[#C7320B] mb-1">
                Media Sosial
              </h3>
              <p className="text-xs text-[#6E2C1B] mb-3">
                Ikuti info open-order harian, giveaway, dan update menu terbaru.
              </p>
              <p className="text-sm font-bold text-[#C7320B]">
                {storeConfig.instagramHandle}
              </p>
            </div>

            <div className="pt-4 mt-2">
              <a
                href={storeConfig.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#F5E7B8] hover:bg-[#EFE0B0] text-[#C7320B] text-xs font-bold rounded-xl border border-[#EAD29C] transition-colors"
              >
                <span>Kunjungi Instagram</span>
              </a>
            </div>
          </div>

          {/* Card 3: Alamat & Area Pelayanan */}
          <div className="bg-[#FCF6E0] border-2 border-[#EAD29C] rounded-2xl p-6 flex flex-col justify-between hover:border-[#FF8234] transition-all duration-200">
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#C7320B]/10 text-[#C7320B] flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-black text-lg text-[#C7320B] mb-1">
                Lokasi &amp; Area Antar
              </h3>
              <p className="text-sm font-bold text-[#C7320B] mb-1.5">
                {storeConfig.storeAddress}
              </p>
              <p className="text-xs text-[#6E2C1B]">
                {storeConfig.campusArea}
              </p>
            </div>

            <div className="pt-4 mt-2">
              <a
                href="#lokasi-peta"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#F5E7B8] hover:bg-[#EFE0B0] text-[#C7320B] text-xs font-bold rounded-xl border border-[#EAD29C] transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Lihat di Peta</span>
              </a>
            </div>
          </div>

          {/* Card 4: Jam Operasional */}
          <div className="bg-[#FCF6E0] border-2 border-[#EAD29C] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#C7320B]/15 text-[#C7320B] flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-black text-lg text-[#C7320B] mb-1">
                Waktu Operasional
              </h3>
              <p className="text-xs text-[#6E2C1B] mb-3">
                Jadwal produksi fresh dan jam fast-response chat pesanan.
              </p>
              <p className="text-sm font-semibold text-[#C7320B]">
                {storeConfig.operationalHours}
              </p>
            </div>

            <div className="pt-4 mt-2 text-[11px] text-[#C7320B] font-semibold">
              *Pesanan diproses fresh setiap hari untuk menjaga kualitas rasa.
            </div>
          </div>

        </div>

        {/* Google Maps Embedded Location Card */}
        <div
          id="lokasi-peta"
          className="mt-8 bg-[#FFFDF5] border-2 border-[#EAD29C] rounded-3xl overflow-hidden shadow-xs"
        >
          <div className="p-5 sm:px-7 sm:py-5 border-b border-[#EAD29C] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#FCF6E0]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C7320B] text-[#FCF6E0] flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#FF8234]">
                  Peta Lokasi Google Maps
                </p>
                <h3 className="font-heading font-black text-lg sm:text-xl text-[#C7320B]">
                  {storeConfig.storeAddress}
                </h3>
                <p className="text-xs text-[#6E2C1B] mt-0.5">
                  {storeConfig.campusArea}
                </p>
              </div>
            </div>

            <a
              href={mapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF8234] hover:bg-[#e86e22] text-[#3E1004] text-xs font-extrabold rounded-xl transition-colors shadow-xs shrink-0"
            >
              <Navigation className="w-4 h-4" />
              <span>Buka Google Maps</span>
            </a>
          </div>

          <StoreLocationMap
            storeConfig={storeConfig}
            onResolvedUriChange={setResolvedPlaceUri}
          />
        </div>

      </div>
    </section>
  );
};

