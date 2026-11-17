import React, { useEffect, useState } from 'react';
import { X, Save, RotateCcw, Check, Phone, Instagram, MapPin, Clock, Navigation, Link2 } from 'lucide-react';
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

  useEffect(() => {
    if (isOpen) {
      setForm(currentConfig);
      setIsSaved(false);
    }
  }, [isOpen, currentConfig]);

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
        className="fixed inset-0 bg-[#C7320B]/50 backdrop-blur-xs transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative bg-[#FCF6E0] border-2 border-[#EAD29C] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#EAD29C]">
            <div>
              <h3 className="font-heading text-xl font-black text-[#C7320B]">
                Pengaturan Informasi Toko
              </h3>
              <p className="text-xs text-[#6E2C1B] mt-0.5">
                Atur nomor WhatsApp, jam buka, alamat, dan titik Google Maps secara manual
              </p>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 text-[#6E2C1B] hover:text-[#C7320B] rounded-full hover:bg-[#F5E7B8]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            
            {/* WhatsApp Number (International format) */}
            <div>
              <label className="block text-xs font-bold text-[#C7320B] mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#FF8234]" />
                <span>Nomor WhatsApp Bisnis (Format Internasional):</span>
              </label>
              <input
                type="text"
                value={form.whatsappNumber}
                onChange={e => setForm({ ...form, whatsappNumber: e.target.value })}
                placeholder="Contoh: 6281234567890 (tanpa tanda + atau spasi)"
                className="w-full text-xs font-medium p-2.5 bg-white border border-[#EAD29C] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF8234] text-[#C7320B]"
                required
              />
              <p className="text-[11px] text-[#6E2C1B] mt-1">
                Gunakan format 628... agar tautan wa.me langsung mengarah ke nomor HP Anda.
              </p>
            </div>

            {/* WhatsApp Display Label */}
            <div>
              <label className="block text-xs font-bold text-[#C7320B] mb-1">
                Teks Tampilan Nomor WhatsApp:
              </label>
              <input
                type="text"
                value={form.whatsappDisplay}
                onChange={e => setForm({ ...form, whatsappDisplay: e.target.value })}
                placeholder="Contoh: +62 812-3456-7890"
                className="w-full text-xs font-medium p-2.5 bg-white border border-[#EAD29C] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF8234] text-[#C7320B]"
                required
              />
            </div>

            {/* Instagram Handle */}
            <div>
              <label className="block text-xs font-bold text-[#C7320B] mb-1 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-[#FF8234]" />
                <span>Akun Instagram:</span>
              </label>
              <input
                type="text"
                value={form.instagramHandle}
                onChange={e => setForm({ ...form, instagramHandle: e.target.value })}
                placeholder="Contoh: @seruputkunyah"
                className="w-full text-xs font-medium p-2.5 bg-white border border-[#EAD29C] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF8234] text-[#C7320B]"
              />
            </div>

            {/* Store Address */}
            <div className="pt-2 border-t border-[#EAD29C]/70 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#FF8234]">
                Pengaturan Lokasi &amp; Google Maps
              </p>

              <div>
                <label className="block text-xs font-bold text-[#C7320B] mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C7320B]" />
                  <span>Alamat Lengkap Toko / Booth:</span>
                </label>
                <input
                  type="text"
                  value={form.storeAddress}
                  onChange={e => setForm({ ...form, storeAddress: e.target.value })}
                  placeholder="Contoh: Jl. Mujair 1 No. 22, Pasar Minggu"
                  className="w-full text-xs font-medium p-2.5 bg-white border border-[#EAD29C] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF8234] text-[#C7320B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#C7320B] mb-1 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#FF8234]" />
                  <span>Query Pencarian / Koordinat Google Maps:</span>
                </label>
                <input
                  type="text"
                  value={form.gmapsQuery}
                  onChange={e => setForm({ ...form, gmapsQuery: e.target.value })}
                  placeholder="Contoh: Jl. Mujair 1 No. 22, Pasar Minggu atau -6.2845, 106.8441"
                  className="w-full text-xs font-medium p-2.5 bg-white border border-[#EAD29C] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF8234] text-[#C7320B]"
                  required
                />
                <p className="text-[11px] text-[#6E2C1B] mt-1">
                  Bisa isi nama jalan/patokan lengkap atau tempel koordinat (lat, lng) dari Google Maps agar pin pindah otomatis.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#C7320B] mb-1 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-[#C7320B]" />
                  <span>Link Share Google Maps (Opsional):</span>
                </label>
                <input
                  type="url"
                  value={form.gmapsUrl ?? ''}
                  onChange={e => setForm({ ...form, gmapsUrl: e.target.value })}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full text-xs font-medium p-2.5 bg-white border border-[#EAD29C] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF8234] text-[#C7320B]"
                />
                <p className="text-[11px] text-[#6E2C1B] mt-1">
                  Jika diisi, tombol &ldquo;Buka Google Maps&rdquo; akan memakai link ini langsung. Kosongkan untuk otomatis mengikuti query di atas.
                </p>
              </div>
            </div>

            {/* Campus Service Area */}
            <div>
              <label className="block text-xs font-bold text-[#C7320B] mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C7320B]" />
                <span>Keterangan Area Pelayanan / COD:</span>
              </label>
              <input
                type="text"
                value={form.campusArea}
                onChange={e => setForm({ ...form, campusArea: e.target.value })}
                placeholder="Contoh: Pasar Minggu, Jakarta Selatan & Area Kampus (COD / Antar)"
                className="w-full text-xs font-medium p-2.5 bg-white border border-[#EAD29C] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF8234] text-[#C7320B]"
              />
            </div>

            {/* Operational Hours */}
            <div>
              <label className="block text-xs font-bold text-[#C7320B] mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#FF8234]" />
                <span>Waktu Operasional:</span>
              </label>
              <input
                type="text"
                value={form.operationalHours}
                onChange={e => setForm({ ...form, operationalHours: e.target.value })}
                placeholder="Contoh: Senin – Sabtu, 10.00 – 19.30 WIB"
                className="w-full text-xs font-medium p-2.5 bg-white border border-[#EAD29C] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF8234] text-[#C7320B]"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-4 flex items-center justify-between border-t border-[#EAD29C]">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs text-[#6E2C1B] hover:text-[#C7320B] font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Default</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-[#C7320B] hover:bg-[#F5E7B8] rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#C7320B] hover:bg-[#A12606] rounded-xl shadow-xs transition-colors"
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

