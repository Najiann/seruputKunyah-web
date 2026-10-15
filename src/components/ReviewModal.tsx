import React, { useState } from 'react';
import { X, Star, Send, MessageSquareHeart, Check, AlertCircle, Plus } from 'lucide-react';
import { CustomerReview, StoreConfig } from '../types';
import { addCustomerReview } from '../data/reviews';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewAdded: (reviews: CustomerReview[]) => void;
  storeConfig: StoreConfig;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onReviewAdded,
  storeConfig,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [selectedMenus, setSelectedMenus] = useState<string[]>(['Makaroni Basah']);
  const [comment, setComment] = useState<string>('');
  const [suggestion, setSuggestion] = useState<string>('');
  const [sendToWa, setSendToWa] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const menuOptions = [
    'Makaroni Basah',
    'Makaroni Kering',
    'Es Teh Manis',
    'Es Teh Lemon',
    'Paket Kombo Santai',
    'Paket Kombo Segar Lemon',
  ];

  const toggleMenu = (menu: string) => {
    setSelectedMenus(prev => {
      if (prev.includes(menu)) {
        const next = prev.filter(m => m !== menu);
        return next;
      } else {
        return [...prev, menu];
      }
    });
  };

  const ratingLabels: Record<number, string> = {
    1: '⭐ Kecewa',
    2: '⭐⭐ Kurang Enak',
    3: '⭐⭐⭐ Cukup Lumayan',
    4: '⭐⭐⭐⭐ Enak & Puas',
    5: '⭐⭐⭐⭐⭐ Mantap, Nagih Banget!',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Mohon isi nama atau panggilan kamu.');
      return;
    }
    if (selectedMenus.length === 0) {
      setErrorMessage('Mohon pilih minimal satu menu yang kamu beli.');
      return;
    }
    if (!comment.trim()) {
      setErrorMessage('Mohon tuliskan ulasan atau pengalaman rasa pesananmu.');
      return;
    }

    setErrorMessage('');
    const menuSummary = selectedMenus.join(', ');

    const updated = addCustomerReview({
      name: name.trim(),
      roleOrAffiliation: role.trim() || 'Pelanggan Kampus',
      rating,
      menuBought: menuSummary,
      comment: comment.trim(),
      suggestion: suggestion.trim() || undefined,
    });

    onReviewAdded(updated);
    setIsSuccess(true);

    // If user opts to also send to WhatsApp admin
    if (sendToWa) {
      const waText = [
        'Halo admin SERUPUT & KUNYAH! Saya baru saja mengisi ulasan & saran di website:\n',
        `Nama: ${name.trim()}`,
        `Menu yang dibeli: ${menuSummary}`,
        `Rating: ${'⭐'.repeat(rating)} (${rating}/5)`,
        `Ulasan: ${comment.trim()}`,
        suggestion.trim() ? `Kritik & Saran: ${suggestion.trim()}` : '',
        '\nTerima kasih dan sukses selalu untuk usahanya!',
      ]
        .filter(Boolean)
        .join('\n');

      const cleanPhone = storeConfig.whatsappNumber.replace(/[^0-9]/g, '');
      const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }

    setTimeout(() => {
      setIsSuccess(false);
      setName('');
      setRole('');
      setComment('');
      setSuggestion('');
      setSelectedMenus(['Makaroni Basah']);
      setRating(5);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#70412E]/60 backdrop-blur-xs transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-5">
        <div className="relative bg-[#FFFAF1] border-2 border-[#E8D5B5] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[#E8D5B5]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5E6C8] text-[#70412E] rounded-full text-xs font-bold border border-[#E8D5B5]">
                <MessageSquareHeart className="w-3.5 h-3.5 text-[#C58B55]" />
                <span>Suara Pelanggan</span>
              </div>
              <h3 className="font-heading text-xl sm:text-2xl font-black text-[#70412E]">
                Tulis Ulasan, Kritik &amp; Saran
              </h3>
              <p className="text-xs text-[#806B58]">
                Bantu usaha mahasiswa kami terus berkembang menjadi lebih baik!
              </p>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="p-1.5 text-[#806B58] hover:text-[#70412E] rounded-full hover:bg-[#F5E6C8]"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            
            {/* Rating Stars Picker */}
            <div className="bg-[#F5E6C8]/40 p-4 rounded-2xl border border-[#E8D5B5] text-center space-y-1.5">
              <label className="block text-xs font-bold text-[#70412E] uppercase tracking-wider">
                Berapa Bintang Untuk Pesananmu? *
              </label>
              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map(star => {
                  const active = star <= (hoverRating || rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                      aria-label={`Beri bintang ${star}`}
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          active
                            ? 'text-amber-500 fill-amber-500 filter drop-shadow-xs'
                            : 'text-[#E8D5B5] fill-transparent'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs font-bold text-[#70412E]">
                {ratingLabels[hoverRating || rating]}
              </p>
            </div>

            {/* Customer Name & Role in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#70412E] mb-1">
                  Nama / Panggilan Kamu *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Contoh: Nabila / Dimas"
                  required
                  className="w-full text-xs font-medium p-2.5 bg-white border border-[#E8D5B5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C58B55] text-[#70412E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#70412E] mb-1">
                  Fakultas / Status (Opsional)
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="Contoh: Mahasiswa FEB / Kos Melati"
                  className="w-full text-xs font-medium p-2.5 bg-white border border-[#E8D5B5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C58B55] text-[#70412E]"
                />
              </div>
            </div>

            {/* Menu Bought Multi-Select */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#70412E]">
                  Menu Yang Kamu Pesan (Bisa Pilih Lebih Dari 1): *
                </label>
                <span className="text-[11px] font-bold text-[#78804B]">
                  {selectedMenus.length} dipilih
                </span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-0.5">
                {menuOptions.map(opt => {
                  const isSelected = selectedMenus.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleMenu(opt)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-bold border text-left transition-all flex items-center justify-between gap-1.5 cursor-pointer active:scale-95 ${
                        isSelected
                          ? 'bg-[#70412E] text-white border-[#70412E] shadow-2xs'
                          : 'bg-white text-[#70412E] border-[#E8D5B5] hover:bg-[#F5E6C8]/40'
                      }`}
                      aria-pressed={isSelected}
                    >
                      <span className="truncate">{opt}</span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 shrink-0 text-white" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 shrink-0 text-[#806B58]/50" />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-[#806B58]">
                Klik menu untuk memilih atau membatalkan pilihan.
              </p>
            </div>

            {/* Comment / Ulasan */}
            <div>
              <label className="block text-xs font-bold text-[#70412E] mb-1">
                Ulasan &amp; Pengalaman Rasa *
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Bagikan ceritamu: bagaimana rasa makaroni, tingkat pedasnya, atau kesegaran es tehnya..."
                required
                className="w-full text-xs font-medium p-2.5 bg-white border border-[#E8D5B5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C58B55] text-[#70412E] placeholder:text-[#806B58]/50"
              />
            </div>

            {/* Suggestion / Kritik & Saran */}
            <div>
              <label className="block text-xs font-bold text-[#70412E] mb-1">
                Kritik &amp; Saran Perbaikan (Opsional):
              </label>
              <textarea
                rows={2}
                value={suggestion}
                onChange={e => setSuggestion(e.target.value)}
                placeholder="Contoh saran: Tambah varian rasa baru, pengemasan, atau titik kumpul COD..."
                className="w-full text-xs font-medium p-2.5 bg-white border border-[#E8D5B5] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#C58B55] text-[#70412E] placeholder:text-[#806B58]/50"
              />
            </div>

            {/* Checkbox: Kirim juga ke WA */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="send-to-wa-checkbox"
                type="checkbox"
                checked={sendToWa}
                onChange={e => setSendToWa(e.target.checked)}
                className="w-4 h-4 rounded text-[#70412E] focus:ring-[#C58B55] accent-[#70412E]"
              />
              <label htmlFor="send-to-wa-checkbox" className="text-xs text-[#806B58] select-none cursor-pointer">
                Teruskan juga kritik &amp; saran ini ke chat WhatsApp Admin
              </label>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <p className="text-xs text-red-600 font-bold flex items-center gap-1.5 pt-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-[#E8D5B5] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-[#70412E] hover:bg-[#F5E6C8] rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isSuccess}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#70412E] hover:bg-[#583020] rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-green-300" />
                    <span>Ulasan Berhasil Disimpan!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Ulasan Sekarang</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
