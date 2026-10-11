import React from 'react';
import { Heart, Sparkles, GraduationCap, UtensilsCrossed } from 'lucide-react';
import { Logo } from './Logo';

export const BrandStory: React.FC = () => {
  return (
    <section id="tentang" className="py-16 sm:py-24 bg-[#FFFAF1] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Visual Brand Badge & Emblem */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative p-8 sm:p-10 bg-[#F5E6C8]/50 rounded-3xl border-2 border-[#E8D5B5] shadow-xs text-center max-w-sm w-full">
              <div className="mb-4 inline-block">
                <Logo size="xl" variant="full" />
              </div>
              <div className="pt-4 border-t border-[#E8D5B5] space-y-1">
                <p className="text-xs font-bold text-[#78804B] uppercase tracking-wider">
                  Inisiatif Kuliner Mahasiswa
                </p>
                <p className="text-xs text-[#806B58]">
                  Kewirausahaan Digital &bull; Home-Based &bull; Kampus
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Story Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#78804B] uppercase tracking-wider inline-flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#C58B55]" />
                <span>Cerita di Balik Rasa</span>
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#70412E] tracking-tight leading-tight">
                Camilan Favorit, <br />
                <span className="text-[#C58B55]">Teman Setiap Momen</span>
              </h2>
            </div>

            <p className="text-base text-[#806B58] leading-relaxed">
              <strong>SERUPUT &amp; KUNYAH</strong> lahir dari ide sederhana di sela-sela obrolan kuliah: 
              menghadirkan teman ngemil yang renyah gurih sekaligus pelepas dahaga yang manis segar tanpa harus menguras kantong mahasiswa.
            </p>

            <p className="text-base text-[#806B58] leading-relaxed">
              Dikembangkan oleh mahasiswa melalui program Kewirausahaan Digital, kami memproduksi makaroni basah dan makaroni kering secara <em>home-based</em> dengan racikan bumbu rempah yang higienis dan nikmat. Ditambah seduhan es teh manis dan lemon tea dingin, setiap suapan dan seruputan pas untuk menemani kamu saat nugas tugas akhir, istirahat kelas, maupun kumpul santai di kosan.
            </p>

            {/* Pillar highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#F5E6C8]/40 border border-[#E8D5B5] flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#70412E] text-white shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-sm text-[#70412E]">
                    Karya Usaha Mahasiswa
                  </h4>
                  <p className="text-xs text-[#806B58] mt-0.5">
                    Dikelola langsung oleh mahasiswa dengan semangat wirausaha mandiri dan kreatif.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F5E6C8]/40 border border-[#E8D5B5] flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#78804B] text-white shrink-0 mt-0.5">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-sm text-[#70412E]">
                    Home-Made &amp; Higienis
                  </h4>
                  <p className="text-xs text-[#806B58] mt-0.5">
                    Produksi skala rumahan yang mengutamakan kebersihan bahan dan cita rasa otentik.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
