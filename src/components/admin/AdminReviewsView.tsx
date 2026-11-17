import React, { useMemo, useState } from 'react';
import {
  Search,
  Star,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  AlertCircle,
  X,
} from 'lucide-react';
import { CustomerReview } from '../../types';
import { useAdminAuth } from './AdminAuthContext';
import { deleteAdminReview, toggleReviewPublished } from '../../services/reviewService';

interface AdminReviewsViewProps {
  reviews: CustomerReview[];
  tableMissing: boolean;
  loading: boolean;
  onRefresh: () => Promise<void>;
}

export const AdminReviewsView: React.FC<AdminReviewsViewProps> = ({
  reviews,
  tableMissing,
  loading,
  onRefresh,
}) => {
  const { profile } = useAdminAuth();
  const isAdmin = profile?.role === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'published' | 'hidden'>('all');
  const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | 'low'>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const metrics = useMemo(() => {
    const total = reviews.length;
    const publishedCount = reviews.filter((r) => r.isPublished !== false).length;
    const hiddenCount = total - publishedCount;
    const fiveStarCount = reviews.filter((r) => r.rating === 5).length;
    const avg =
      total > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
        : '0.0';
    return { total, publishedCount, hiddenCount, fiveStarCount, avg };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reviews.filter((r) => {
      const isPub = r.isPublished !== false;
      if (visibilityFilter === 'published' && !isPub) return false;
      if (visibilityFilter === 'hidden' && isPub) return false;
      if (ratingFilter === '5' && r.rating !== 5) return false;
      if (ratingFilter === '4' && r.rating !== 4) return false;
      if (ratingFilter === 'low' && r.rating > 3) return false;
      if (
        q &&
        !r.name.toLowerCase().includes(q) &&
        !r.comment.toLowerCase().includes(q) &&
        !r.menuBought.toLowerCase().includes(q) &&
        !(r.suggestion || '').toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [reviews, visibilityFilter, ratingFilter, searchQuery]);

  const handleTogglePublished = async (review: CustomerReview) => {
    if (!profile) return;
    setActionError(null);
    setActionSuccess(null);
    setBusyId(review.id);
    try {
      const nextPub = review.isPublished === false;
      await toggleReviewPublished(review.id, nextPub, profile);
      setActionSuccess(
        `Ulasan dari ${review.name} sekarang ${nextPub ? 'ditampilkan di website' : 'disembunyikan'}.`
      );
      await onRefresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal memperbarui status ulasan.');
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmDelete = async (review: CustomerReview) => {
    if (!profile) return;
    setActionError(null);
    setActionSuccess(null);
    setBusyId(review.id);
    try {
      await deleteAdminReview(review.id, profile);
      setConfirmDeleteId(null);
      setActionSuccess(`Ulasan dari ${review.name} berhasil dihapus.`);
      await onRefresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal menghapus ulasan.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#C7320B] tracking-tight">
            Ulasan &amp; Kritik Saran Pelanggan
          </h1>
          <p className="text-xs sm:text-sm text-[#6E2C1B] mt-0.5">
            Pantau penilaian pelanggan yang masuk dari website publik serta moderasi ulasan yang tampil.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void onRefresh()}
          className="px-3.5 py-2 bg-[#FFFDF5] border border-[#EAD29C] hover:border-[#FF8234] text-[#C7320B] text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Muat Ulang</span>
        </button>
      </div>

      {tableMissing && (
        <div className="p-4 rounded-2xl bg-[#D97706]/10 border border-[#D97706]/30 text-xs text-[#3E1004] space-y-1">
          <p className="font-black text-[#C7320B]">Tabel `public.reviews` Belum Dibuat di Supabase</p>
          <p className="text-[#6E2C1B]">
            Jalankan script SQL migrasi 002 di Supabase SQL Editor untuk mengaktifkan penyimpanan ulasan pelanggan ke database.
          </p>
        </div>
      )}

      {/* 4 KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-5 space-y-1">
          <p className="text-xs font-semibold text-[#6E2C1B]">Total Ulasan Masuk</p>
          <p className="font-mono tabular-nums text-2xl font-black text-[#C7320B]">
            {metrics.total}
          </p>
          <p className="text-xs text-[#6E2C1B] font-mono tabular-nums">
            {metrics.publishedCount} tampil di website
          </p>
        </div>

        <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-5 space-y-1">
          <p className="text-xs font-semibold text-[#6E2C1B]">Rata-Rata Rating</p>
          <p className="font-mono tabular-nums text-2xl font-black text-[#C7320B]">
            {metrics.avg} / 5.0
          </p>
          <p className="text-xs text-[#6E2C1B]">Dari seluruh ulasan tersimpan</p>
        </div>

        <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-5 space-y-1">
          <p className="text-xs font-semibold text-[#6E2C1B]">Rating Bintang 5</p>
          <p className="font-mono tabular-nums text-2xl font-black text-[#16A34A]">
            {metrics.fiveStarCount}
          </p>
          <p className="text-xs text-[#6E2C1B]">Pembeli sangat puas</p>
        </div>

        <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-5 space-y-1">
          <p className="text-xs font-semibold text-[#6E2C1B]">Disembunyikan</p>
          <p className="font-mono tabular-nums text-2xl font-black text-[#6E2C1B]">
            {metrics.hiddenCount}
          </p>
          <p className="text-xs text-[#6E2C1B]">Tidak tampil ke publik</p>
        </div>
      </div>

      {/* Feedback Banner */}
      {actionError && (
        <div className="p-3.5 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 text-xs font-semibold text-[#DC2626] flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {actionError}
          </span>
          <button type="button" onClick={() => setActionError(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/30 text-xs font-semibold text-[#16A34A] flex items-center justify-between gap-2">
          <span>{actionSuccess}</span>
          <button type="button" onClick={() => setActionSuccess(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6E2C1B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, menu, isi ulasan, atau saran..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#EAD29C] rounded-xl text-[#3E1004] focus:outline-none focus:ring-2 focus:ring-[#FF8234]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={visibilityFilter}
            onChange={(e) =>
              setVisibilityFilter(e.target.value as 'all' | 'published' | 'hidden')
            }
            className="px-3 py-2 text-xs font-bold bg-white border border-[#EAD29C] rounded-xl text-[#3E1004]"
          >
            <option value="all">Semua Status</option>
            <option value="published">Tampil di Website</option>
            <option value="hidden">Disembunyikan</option>
          </select>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value as 'all' | '5' | '4' | 'low')}
            className="px-3 py-2 text-xs font-bold bg-white border border-[#EAD29C] rounded-xl text-[#3E1004]"
          >
            <option value="all">Semua Bintang</option>
            <option value="5">Bintang 5</option>
            <option value="4">Bintang 4</option>
            <option value="low">Bintang 1–3</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#6E2C1B]">Memuat ulasan pelanggan...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#6E2C1B] space-y-1">
            <p className="font-bold text-[#C7320B]">Belum ada ulasan yang cocok</p>
            <p>
              Ulasan yang dikirim pelanggan melalui formulir ulasan di website publik akan muncul otomatis di sini.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAD29C]/70">
            {filteredReviews.map((item) => {
              const isPub = item.isPublished !== false;
              const isBusy = busyId === item.id;
              return (
                <div key={item.id} className="p-5 hover:bg-[#FCF6E0]/50 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-heading font-black text-sm text-[#C7320B]">
                          {item.name}
                        </p>
                        <span className="text-xs text-[#6E2C1B]">
                          · {item.roleOrAffiliation || 'Pelanggan'} · {item.date}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#3E1004]">
                        Menu: {item.menuBought} ·{' '}
                        <span className={isPub ? 'text-[#16A34A]' : 'text-[#D97706]'}>
                          {isPub ? 'Tampil di Website' : 'Disembunyikan'}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-0.5" aria-label={`Rating ${item.rating} dari 5`}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= item.rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-[#EAD29C]'
                            }`}
                          />
                        ))}
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => void handleTogglePublished(item)}
                            className="px-2.5 py-1.5 bg-white border border-[#EAD29C] hover:border-[#FF8234] text-[#C7320B] text-xs font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer whitespace-nowrap disabled:opacity-50"
                          >
                            {isPub ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Sembunyikan</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Tampilkan</span>
                              </>
                            )}
                          </button>

                          {confirmDeleteId === item.id ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => void handleConfirmDelete(item)}
                                className="px-2.5 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-lg cursor-pointer whitespace-nowrap"
                              >
                                Ya, Hapus
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1.5 text-xs font-bold text-[#6E2C1B] cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => setConfirmDeleteId(item.id)}
                              className="p-1.5 bg-white border border-[#EAD29C] hover:border-[#DC2626] text-[#6E2C1B] hover:text-[#DC2626] rounded-lg cursor-pointer"
                              title="Hapus ulasan"
                              aria-label={`Hapus ulasan ${item.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-[#3E1004] leading-relaxed">
                    &ldquo;{item.comment}&rdquo;
                  </p>

                  {item.suggestion && (
                    <p className="text-xs text-[#6E2C1B] bg-[#FCF6E0] border border-[#EAD29C] rounded-xl px-3.5 py-2.5">
                      <strong className="text-[#C7320B]">Kritik &amp; Saran:</strong>{' '}
                      {item.suggestion}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
