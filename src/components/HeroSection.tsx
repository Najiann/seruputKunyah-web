import React from 'react';
import { ArrowDown, Flame, Sparkles, Coffee } from 'lucide-react';

interface HeroSectionProps {
  onOrderNow: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOrderNow }) => {
  return (
    <section
      id="hero"
      className="relative pt-28 pb-14 sm:pt-36 sm:pb-20 overflow-hidden bg-gradient-to-b from-[#F5E6C8]/40 via-[#FFFAF1] to-[#FFFAF1]"
    >
      {/* Subtle organic decorative elements inspired by logo leaf and steam motifs */}
      <div className="absolute top-20 left-6 sm:left-16 w-32 h-32 rounded-full bg-[#C58B55]/10 blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-[#78804B]/10 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Authentic Brand Tagline Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5E6C8] border border-[#E8D5B5] text-[#70412E] text-xs font-bold tracking-wide shadow-xs mx-auto lg:mx-0">
              <span className="w-2 h-2 rounded-full bg-[#78804B] animate-ping" />
              <span>Camilan Mahasiswa &bull; Seruput Segar, Kunyah Lezat</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-[#70412E] tracking-tight leading-[1.12]">
              Teman Ngemil, <br className="hidden sm:inline" />
              <span className="text-[#C58B55] underline decoration-[#78804B]/40 decoration-wavy decoration-2">
                Teman Seruput!
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#806B58] max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Temukan camilan makaroni favorit dan minuman segar yang pas menemani harimu.
              Renyah gurihnya makaroni dipadukan manis segarnya es teh, siap nemenin waktu santai, nugas, dan nongkrong bareng.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
              <a
                href="#menu"
                className="w-full sm:w-auto px-7 py-3.5 bg-[#70412E] hover:bg-[#583020] text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-center active:scale-95"
              >
                Lihat Menu Pilihan
              </a>
              <button
                onClick={onOrderNow}
                type="button"
                className="w-full sm:w-auto px-7 py-3.5 bg-[#F5E6C8] hover:bg-[#ebd3a8] text-[#70412E] border border-[#C58B55]/40 font-bold text-base rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Pesan Sekarang</span>
                <ArrowDown className="w-4 h-4 text-[#70412E]" />
              </button>
            </div>

            {/* Key Value Points (Clean unboxed metadata) */}
            <div className="pt-4 border-t border-[#E8D5B5]/60 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-5 text-xs sm:text-sm font-semibold text-[#806B58]">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#C58B55]" />
                <span>Bumbu Gurih Pilihan</span>
              </div>
              <span className="text-[#C58B55]">&bull;</span>
              <div className="flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-[#78804B]" />
                <span>Es Teh Segar Mantap</span>
              </div>
              <span className="text-[#C58B55]">&bull;</span>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C58B55]" />
                <span>Harga Ramah Mahasiswa</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Product Photography */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Warm decorative frame background */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#C58B55]/30 to-[#F5E6C8] rounded-3xl transform rotate-2 -z-10" />
              
              <div className="relative rounded-2xl overflow-hidden border-4 border-[#FFFAF1] shadow-xl bg-white aspect-4/3">
                <img
                  src="/images/hero.jpg"
                  alt="Paduan makaroni pedas gurih dan es teh segar SERUPUT & KUNYAH"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  loading="eager"
                  width={600}
                  height={450}
                />

                {/* Floating highlight badge */}
                <div className="absolute bottom-3 left-3 bg-[#FFFAF1]/95 backdrop-blur-xs py-2 px-3 rounded-xl border border-[#E8D5B5] shadow-md flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#F5E6C8] flex items-center justify-center text-sm font-black text-[#70412E]">
                    Rp4k
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-bold text-[#806B58] uppercase tracking-wider">Mulai dari</p>
                    <p className="text-xs font-black text-[#70412E]">Es Teh & Makaroni Nikmat</p>
                  </div>
                </div>
              </div>

              {/* Decorative stamp on top right */}
              <div className="absolute -top-3 -right-3 bg-[#78804B] text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-md uppercase tracking-wider border-2 border-white rotate-6">
                100% Home-Made
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
