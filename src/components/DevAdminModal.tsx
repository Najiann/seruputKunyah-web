import React, { useState } from 'react';
import { X, Code2, Settings2, ShieldCheck, Terminal, Tag } from 'lucide-react';
import { StoreConfig } from '../types';
import { StoreConfigModal } from './StoreConfigModal';
import { VuePortfolioModal } from './VuePortfolioModal';
import { ProductPriceModal } from './ProductPriceModal';

interface DevAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: StoreConfig;
  onSaveConfig: (newConfig: StoreConfig) => void;
}

export const DevAdminModal: React.FC<DevAdminModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSaveConfig,
}) => {
  const [activeModal, setActiveModal] = useState<'none' | 'vue' | 'config' | 'price'>('none');

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#70412E]/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        />

        <div className="min-h-full flex items-center justify-center p-4">
          <div className="relative bg-[#FFFAF1] border-2 border-[#E8D5B5] rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-5">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8D5B5]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#70412E] text-white rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-black text-[#70412E]">
                    Developer &amp; Admin Panel
                  </h3>
                  <p className="text-[11px] font-semibold text-[#806B58]">
                    Akses Rahasia (Shortcut: <kbd className="px-1.5 py-0.5 bg-[#F5E6C8] rounded text-[#70412E] font-mono text-[10px]">Shift + A</kbd>)
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                type="button"
                className="p-1.5 text-[#806B58] hover:text-[#70412E] rounded-full hover:bg-[#F5E6C8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#806B58] leading-relaxed">
              Menu ini tersembunyi dari pembeli umum dan hanya dapat diakses melalui kombinasi tombol atau 5 ketukan rahasia di footer untuk kebutuhan presentasi &amp; konfigurasi.
            </p>

            {/* Action Cards */}
            <div className="space-y-3">
              {/* Option 1: Vue.js 3 Code & Portfolio */}
              <button
                type="button"
                onClick={() => {
                  setActiveModal('vue');
                }}
                className="w-full text-left p-4 rounded-2xl bg-white border border-[#E8D5B5] hover:border-[#78804B] hover:shadow-md transition-all duration-200 flex items-start gap-3.5 group cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-[#78804B]/15 text-[#78804B] group-hover:bg-[#78804B] group-hover:text-white transition-colors shrink-0 mt-0.5">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-sm text-[#70412E]">
                    Kode Sumber &amp; Panduan Vue.js 3
                  </h4>
                  <p className="text-[11px] text-[#806B58] mt-0.5">
                    Lihat &amp; salin struktur modular Vue 3 (Composition API) untuk portofolio &amp; laporan tugas kuliah.
                  </p>
                </div>
              </button>

              {/* Option 2: Store & WhatsApp Config */}
              <button
                type="button"
                onClick={() => {
                  setActiveModal('config');
                }}
                className="w-full text-left p-4 rounded-2xl bg-white border border-[#E8D5B5] hover:border-[#C58B55] hover:shadow-md transition-all duration-200 flex items-start gap-3.5 group cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-[#C58B55]/15 text-[#C58B55] group-hover:bg-[#C58B55] group-hover:text-white transition-colors shrink-0 mt-0.5">
                  <Settings2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-sm text-[#70412E]">
                    Pengaturan Toko &amp; WhatsApp
                  </h4>
                  <p className="text-[11px] text-[#806B58] mt-0.5">
                    Ubah nomor WhatsApp admin, link Instagram, area kampus COD, dan jam operasional.
                  </p>
                </div>
              </button>

              {/* Option 3: Centralized Product & Price Management (SSOT) */}
              <button
                type="button"
                onClick={() => {
                  setActiveModal('price');
                }}
                className="w-full text-left p-4 rounded-2xl bg-white border border-[#E8D5B5] hover:border-[#78804B] hover:shadow-md transition-all duration-200 flex items-start gap-3.5 group cursor-pointer"
              >
                <div className="p-2.5 rounded-xl bg-[#78804B]/15 text-[#78804B] group-hover:bg-[#78804B] group-hover:text-white transition-colors shrink-0 mt-0.5">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-sm text-[#70412E]">
                    Kelola Produk &amp; Harga (Modul Terpusat)
                  </h4>
                  <p className="text-[11px] text-[#806B58] mt-0.5">
                    Ubah harga produk kapan saja; seluruh katalog, paket bundling, keranjang &amp; kasir langsung ikut berubah otomatis.
                  </p>
                </div>
              </button>
            </div>

            {/* Footer tip */}
            <div className="pt-2 text-center">
              <p className="text-[11px] text-[#806B58] flex items-center justify-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#70412E]" />
                <span>Tekan <kbd className="px-1 bg-[#F5E6C8] rounded text-[#70412E] font-mono text-[10px]">Esc</kbd> untuk menutup panel kapan saja</span>
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <VuePortfolioModal
        isOpen={activeModal === 'vue'}
        onClose={() => setActiveModal('none')}
      />

      <StoreConfigModal
        isOpen={activeModal === 'config'}
        onClose={() => setActiveModal('none')}
        currentConfig={currentConfig}
        onSave={onSaveConfig}
      />

      <ProductPriceModal
        isOpen={activeModal === 'price'}
        onClose={() => setActiveModal('none')}
      />
    </>
  );
};
