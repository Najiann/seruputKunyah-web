import React, { useState } from 'react';
import { X, Save, RotateCcw, Check, Phone, Instagram, MapPin, Clock } from 'lucide-react';
import { StoreConfig } from '../types';
import { DEFAULT_STORE_CONFIG, saveStoreConfig } from '../config/storeConfig';

interface StoreConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: StoreConfig;
  onSave: (newConfig: StoreConfig) => void;
}

export const StoreConfigModal: React.FC<StoreConfigModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSave,
}) => {
  const [form, setForm] = useState<StoreConfig>(currentConfig);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveStoreConfig(form);
    onSave(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    setForm(DEFAULT_STORE_CONFIG);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#70412E]/50 backdrop-blur-xs transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative bg-[#FFFAF1] border-2 border-[#E8D5B5] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E8D5B5]">
            <div>
              <h3 className="font-heading text-xl font-black text-[#70412E]">
                Pengaturan Informasi Toko
              </h3>
              <p className="text-xs text-[#806B58] mt-0.5">
                Konfigurasi nomor WhatsApp bisnis dan data operasional mahasiswa
              </p>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 text-[#806B58] hover:text-[#70412E] rounded-full hover:bg-[#F5E6C8]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            
            {/* WhatsApp Number (International format) */}
            <div>
              <label className="block text-xs font-bold text-[#70412E] mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#78804B]" />
                <span>Nomor WhatsApp Bisnis (Format Internasional):</span>
              </label>
              <input
                type="text"
                value={form.whatsappNumber}
                onChange={e => setForm({ ...form, whatsappNumber: e.target.value })}
                placeholder="Contoh: 6281234567890 (tanpa tanda + atau spasi)"
                className="w-full text-xs font-medium p-2.5 bg-white border border-[#E8D5B5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C58B55] text-[#70412E]"
                required
              />
              <p className="text-[11px] text-[#806B58] mt-1">
                Gunakan format 628... agar tautan wa.me langsung mengarah ke nomor HP Anda.
              </p>
            </div>

            {/* WhatsApp Display Label */}
            <div>
              <label className="block text-xs font-bold text-[#70412E] mb-1">
                Teks Tampilan Nomor WhatsApp:
              </label>
              <input
                type="text"
                value={form.whatsappDisplay}
                onChange={e => setForm({ ...form, whatsappDisplay: e.target.value })}
                placeholder="Contoh: +62 812-3456-7890"
                className="w-full text-xs font-medium p-2.5 bg-white border border-[#E8D5B5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C58B55] text-[#70412E]"
                required
              />
            </div>

            {/* Instagram Handle */}
            <div>
              <label className="block text-xs font-bold text-[#70412E] mb-1 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-[#C58B55]" />
                <span>Akun Instagram:</span>
              </label>
              <input
                type="text"
                value={form.instagramHandle}
                onChange={e => setForm({ ...form, instagramHandle: e.target.value })}
                placeholder="Contoh: @seruputkunyah.id"
                className="w-full text-xs font-medium p-2.5 bg-white border border-[#E8D5B5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C58B55] text-[#70412E]"
              />
            </div>

            {/* Campus Service Area */}
            <div>
              <label className="block text-xs font-bold text-[#70412E] mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#70412E]" />
                <span>Area Pelayanan / Kampus:</span>
              </label>
              <input
                type="text"
                value={form.campusArea}
                onChange={e => setForm({ ...form, campusArea: e.target.value })}
                placeholder="Contoh: Sekitar Kampus & Kos Mahasiswa (COD)"
                className="w-full text-xs font-medium p-2.5 bg-white border border-[#E8D5B5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C58B55] text-[#70412E]"
              />
            </div>

            {/* Operational Hours */}
            <div>
              <label className="block text-xs font-bold text-[#70412E] mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#78804B]" />
                <span>Waktu Operasional:</span>
              </label>
              <input
                type="text"
                value={form.operationalHours}
                onChange={e => setForm({ ...form, operationalHours: e.target.value })}
                placeholder="Contoh: Senin – Sabtu, 10.00 – 19.30 WIB"
                className="w-full text-xs font-medium p-2.5 bg-white border border-[#E8D5B5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C58B55] text-[#70412E]"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-4 flex items-center justify-between border-t border-[#E8D5B5]">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs text-[#806B58] hover:text-[#70412E] font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Default</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-[#70412E] hover:bg-[#F5E6C8] rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#70412E] hover:bg-[#583020] rounded-xl shadow-xs transition-colors"
                >
                  {isSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Tersimpan!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
