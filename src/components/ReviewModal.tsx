import React, { useState } from 'react';
import { X, Star, Send, MessageSquareHeart, Check, AlertCircle, Plus } from 'lucide-react';
import { CustomerReview, StoreConfig } from '../types';
import { addCustomerReview } from '../data/reviews';
import { useProducts } from '../context/ProductContext';

/**
 * ============================================================================
 * PROPS (Property / Parameter Masukan Komponen)
 * ============================================================================
 * Di Laravel Blade, ini mirip variabel yang kamu oper ke komponen:
 * <x-review-modal :isOpen="$isOpen" :storeConfig="$storeConfig" />
 */
interface ReviewModalProps {
  isOpen: boolean;                                     // Apakah modal sedang terbuka atau tertutup
  onClose: () => void;                                 // Fungsi untuk menutup modal
  onReviewAdded: (reviews: CustomerReview[]) => void; // Fungsi callback saat ada review baru
  storeConfig: StoreConfig;                            // Data kontak toko (nomor WhatsApp, dll)
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  onReviewAdded,
  storeConfig,
}) => {
  /**
   * ============================================================================
   * STATE (Memori Lokal Komponen)
   * ============================================================================
   * Di Laravel, data form biasanya dikirim via POST $request->all().
   * Di React, kita simpan nilainya secara real-time di memori browser pakai useState.
   * Setiap nilai di state berubah, layar akan otomatis ter-update (Reaktivitas).
   */
  const [rating, setRating] = useState<number>(5);                              // Bintang pilihan (default: 5)
  const [hoverRating, setHoverRating] = useState<number>(0);                    // Efek hover kursor di atas bintang
  const [name, setName] = useState<string>('');                                 // Input nama pelanggan
  const [role, setRole] = useState<string>('');                                 // Input status/fakultas
  const [selectedMenus, setSelectedMenus] = useState<string[]>(['Makaroni Basah']); // Array menu pilihan (Multiple Choice)
  const [comment, setComment] = useState<string>('');                              // Ulasan rasa
  const [suggestion, setSuggestion] = useState<string>('');                        // Kritik & saran
  const [sendToWa, setSendToWa] = useState<boolean>(false);                        // Centang kirim ke WA
  const [errorMessage, setErrorMessage] = useState<string>('');                    // Pesan validasi jika ada error
  const [isSuccess, setIsSuccess] = useState<boolean>(false);                      // Status sukses kirim

  // Jika isOpen = false, jangan render apa-apa (sembunyikan modal)
  if (!isOpen) return null;

  /**
   * ============================================================================
   * DATA OPSI MENU (Dinamis dari products.ts)
   * ============================================================================
   * Ini bagian yang kita bahas tadi!
   * Alih-alih menulis nama menu manual, kita langsung ambil dari PRODUCTS dan BUNDLE_ITEMS.
   * Kalau kamu nambah/hapus menu di src/data/products.ts, di sini otomatis ikut berubah.
   * Di Laravel, konsepnya persis: Product::pluck('name')
   */
  const { menuOptions } = useProducts();

  /**
   * ============================================================================
   * LOGIKA TOGGLE PILIHAN MENU (Multiple Choice)
   * ============================================================================
   * Kalau item sudah dipilih lalu diklik lagi -> Hapus dari pilihan.
   * Kalau item belum dipilih lalu diklik -> Masukkan ke dalam array pilihan.
   */
  const toggleMenu = (menuName: string) => {
    setSelectedMenus(prevSelected => {
      if (prevSelected.includes(menuName)) {
        return prevSelected.filter(item => item !== menuName);
      } else {
        return [...prevSelected, menuName];
      }
    });
  };

  // Label keterangan bintang biar ramah di mata pembeli
  const ratingLabels: Record<number, string> = {
    1: '⭐ Kecewa',
    2: '⭐⭐ Kurang Enak',
    3: '⭐⭐⭐ Cukup Lumayan',
    4: '⭐⭐⭐⭐ Enak & Puas',
    5: '⭐⭐⭐⭐⭐ Mantap, Nagih Banget!',
  };

  /**
   * ============================================================================
   * HANDLER SUBMIT (Ibarat fungsi store(Request $request) di Controller Laravel)
   * ============================================================================
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Cegah halaman reload (khas Single Page Application / SPA)

    // 1. Validasi sederhana
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
    // Gabungkan array menu menjadi teks dipisah koma (misal: "Makaroni Basah, Es Teh Lemon")
    const menuSummary = selectedMenus.join(', ');

    // 2. Simpan ke database lokal (localStorage)
    const updated = addCustomerReview({
      name: name.trim(),
      roleOrAffiliation: role.trim() || 'Pelanggan Kampus',
      rating,
      menuBought: menuSummary,
      comment: comment.trim(),
      suggestion: suggestion.trim() || undefined,
    });

    // Beritahu komponen induk bahwa data review sudah bertambah
    onReviewAdded(updated);
    setIsSuccess(true);

    // 3. Jika dicentang, kirimkan juga kritik & saran ke WhatsApp Toko
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

    // 4. Reset formulir & tutup modal setelah jeda animasi 1.2 detik
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

  /**
   * ============================================================================
   * TAMPILAN UI (JSX / Mirip Blade Template di Laravel)
   * ============================================================================
   */
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop (Latar gelap transparan, klik untuk tutup) */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#70412E]/60 backdrop-blur-xs transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-5">
        <div className="relative bg-[#FFFAF1] border-2 border-[#E8D5B5] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header Modal */}
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

          {/* Form Utama */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            
            {/* Input Bintang (1 - 5) */}
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

            {/* Input Nama & Fakultas/Status */}
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

            {/* Pilihan Menu Multiple Choice (Dinamis dari products.ts) */}
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

            {/* Kolom Ulasan & Pengalaman Rasa */}
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

            {/* Kolom Khusus Kritik & Saran */}
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

            {/* Opsi Kirim ke WhatsApp Admin */}
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

            {/* Pesan Validasi Error */}
            {errorMessage && (
              <p className="text-xs text-red-600 font-bold flex items-center gap-1.5 pt-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}

            {/* Tombol Aksi */}
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
