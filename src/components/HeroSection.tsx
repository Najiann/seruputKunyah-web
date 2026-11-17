import React from 'react';
import { ArrowDown, Flame, Sparkles, Coffee } from 'lucide-react';

interface HeroSectionProps {
  onOrderNow: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOrderNow }) => {
  return (
    <section
      id="hero"
      className="relative pt-28 pb-14 sm:pt-36 sm:pb-20 overflow-hidden bg-gradient-to-b from-[#F5E7B8]/40 via-[#FCF6E0] to-[#FCF6E0]"
    >
      {/* Subtle organic decorative elements inspired by logo leaf and steam motifs */}
      <div className="absolute top-20 left-6 sm:left-16 w-32 h-32 rounded-full bg-[#FF8234]/10 blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-[#FF8234]/12 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Authentic Brand Tagline Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5E7B8] border border-[#EAD29C] text-[#C7320B] text-xs font-bold tracking-wide shadow-xs mx-auto lg:mx-0">
              <span className="w-2 h-2 rounded-full bg-[#FF8234] animate-ping" />
              <span>Camilan Mahasiswa &bull; Seruput Segar, Kunyah Lezat</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-[#C7320B] tracking-tight leading-[1.12]">
              Teman Ngemil, <br className="hidden sm:inline" />
              <span className="text-[#FF8234] underline decoration-[#FF8234]/50 decoration-wavy decoration-2">
                Teman Seruput!
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#6E2C1B] max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Temukan camilan makaroni favorit dan minuman segar yang pas menemani harimu.
              Renyah gurihnya makaroni dipadukan manis segarnya es teh, siap nemenin waktu santai, nugas, dan nongkrong bareng.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <a
                href="#menu"
                className="w-full sm:w-auto px-7 py-3.5 bg-[#C7320B] hover:bg-[#A12606] text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-center active:scale-95"
              >
                Lihat Menu Pilihan
              </a>
              <button
                onClick={onOrderNow}
                type="button"
                className="w-full sm:w-auto px-7 py-3.5 bg-[#F5E7B8] hover:bg-[#EFE0B0] text-[#C7320B] border border-[#FF8234]/40 font-bold text-base rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Pesan Sekarang</span>
                <ArrowDown className="w-4 h-4 text-[#C7320B]" />
              </button>
            </div>

            {/* Key Value Points (Clean unboxed metadata) */}
            <div className="pt-4 border-t border-[#EAD29C]/60 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-5 text-xs sm:text-sm font-semibold text-[#6E2C1B]">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#FF8234]" />
                <span>Bumbu Gurih Pilihan</span>
              </div>
              <span className="text-[#FF8234]">&bull;</span>
              <div className="flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-[#FF8234]" />
                <span>Es Teh Segar Mantap</span>
              </div>
              <span className="text-[#FF8234]">&bull;</span>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FF8234]" />
                <span>Harga Ramah Mahasiswa</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Product Photography */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Warm decorative frame background */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#FF8234]/30 to-[#F5E7B8] rounded-3xl transform rotate-2 -z-10" />
              
              <div className="relative rounded-2xl overflow-hidden border-4 border-[#FCF6E0] shadow-xl bg-white aspect-4/3">
                <img
                  src="/images/hero.jpg"
                  alt="Paduan makaroni pedas gurih dan es teh segar SERUPUT & KUNYAH"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  loading="eager"
                  width={600}
                  height={450}
                />

                {/* Floating highlight badge - Spacious, elegant & cozy */}
                <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 bg-[#FCF6E0]/95 backdrop-blur-md py-3 px-4 sm:px-5 rounded-2xl border-2 border-[#EAD29C] shadow-lg flex items-center gap-3.5 transition-transform duration-300 hover:scale-105">
                  <div className="px-3 py-2 rounded-xl bg-[#F5E7B8] border border-[#EAD29C] flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-[#6E2C1B] uppercase tracking-wider leading-none">Mulai</span>
                    <span className="font-heading text-base sm:text-lg font-black text-[#C7320B] leading-tight">Rp4.000</span>
                  </div>
                  <div className="text-left pr-1">
                    <p className="text-xs sm:text-sm font-black text-[#C7320B] leading-tight">
                      Camilan &amp; Es Teh Segar
                    </p>
                    <p className="text-[11px] font-semibold text-[#C7320B] mt-0.5">
                      Porsi Pas, Teman Santai
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative stamp on top right */}
              <div className="absolute -top-3 -right-3 bg-[#FF8234] text-[#3E1004] text-[11px] font-black px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider border-2 border-[#FCF6E0] rotate-6">
                100% Home-Made
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
