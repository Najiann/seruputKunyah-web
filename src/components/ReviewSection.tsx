import React, { useState, useMemo } from 'react';
import { Star, MessageSquarePlus, CheckCircle2, ThumbsUp, Sparkles, Lightbulb } from 'lucide-react';
import { CustomerReview, StoreConfig } from '../types';
import { ReviewModal } from './ReviewModal';

interface ReviewSectionProps {
  reviews: CustomerReview[];
  onReviewAdded: (newReviews: CustomerReview[]) => void;
  storeConfig: StoreConfig;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  reviews,
  onReviewAdded,
  storeConfig,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | '5star' | 'food' | 'drink'>('all');

  const filteredReviews = useMemo(() => {
    if (filter === '5star') {
      return reviews.filter(r => r.rating === 5);
    }
    if (filter === 'food') {
      return reviews.filter(r => r.menuBought.toLowerCase().includes('makaroni'));
    }
    if (filter === 'drink') {
      return reviews.filter(r => r.menuBought.toLowerCase().includes('teh'));
    }
    return reviews;
  }, [reviews, filter]);

  // Rating metrics
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 5;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const fiveStarPercentage = useMemo(() => {
    if (reviews.length === 0) return 100;
    const count5 = reviews.filter(r => r.rating === 5).length;
    return Math.round((count5 / reviews.length) * 100);
  }, [reviews]);

  return (
    <section id="ulasan" className="py-16 sm:py-24 bg-[#FFFAF1] relative border-t border-[#E8D5B5]/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5E6C8] text-[#70412E] rounded-full text-xs font-bold border border-[#E8D5B5]">
            <Sparkles className="w-3.5 h-3.5 text-[#C58B55]" />
            <span>Suara &amp; Pengalaman Pembeli</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#70412E] tracking-tight">
            Apa Kata Mereka Tentang Kami?
          </h2>
          <p className="text-sm text-[#806B58] leading-relaxed">
            Pengalaman nyata, ulasan rasa, serta kritik &amp; saran dari teman-teman kampus yang sudah menikmati camilan makaroni dan es teh kami.
          </p>
        </div>

        {/* Rating Overview Summary Banner */}
        <div className="bg-[#F5E6C8]/45 border-2 border-[#E8D5B5] rounded-3xl p-6 sm:p-8 mb-10 shadow-xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Score & Stars */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-20 h-20 rounded-2xl bg-[#70412E] text-white flex flex-col items-center justify-center shadow-sm shrink-0">
                <span className="font-heading text-3xl font-black leading-none">{averageRating}</span>
                <span className="text-[10px] uppercase font-bold text-[#F5E6C8] tracking-widest mt-1">/ 5.0</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 justify-center sm:justify-start">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-sm font-bold text-[#70412E]">
                  Berdasarkan {reviews.length} ulasan pelanggan nyata
                </p>
                <p className="text-xs text-[#806B58]">
                  {fiveStarPercentage}% pembeli memberikan penilaian bintang 5 penuh
                </p>
              </div>
            </div>

            {/* Action CTA to Write a Review */}
            <button
              onClick={() => setIsModalOpen(true)}
              type="button"
              className="px-6 py-3.5 bg-[#70412E] hover:bg-[#583020] text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer hover:shadow-lg"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Tulis Ulasan &amp; Kritik Saran</span>
            </button>

          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#70412E] text-white shadow-xs'
                : 'bg-[#F5E6C8]/60 text-[#70412E] hover:bg-[#F5E6C8]'
            }`}
          >
            Semua Ulasan ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('5star')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filter === '5star'
                ? 'bg-[#70412E] text-white shadow-xs'
                : 'bg-[#F5E6C8]/60 text-[#70412E] hover:bg-[#F5E6C8]'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Bintang 5 ({reviews.filter(r => r.rating === 5).length})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('food')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'food'
                ? 'bg-[#70412E] text-white shadow-xs'
                : 'bg-[#F5E6C8]/60 text-[#70412E] hover:bg-[#F5E6C8]'
            }`}
          >
            Makaroni ({reviews.filter(r => r.menuBought.toLowerCase().includes('makaroni')).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('drink')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'drink'
                ? 'bg-[#70412E] text-white shadow-xs'
                : 'bg-[#F5E6C8]/60 text-[#70412E] hover:bg-[#F5E6C8]'
            }`}
          >
            Es Teh ({reviews.filter(r => r.menuBought.toLowerCase().includes('teh')).length})
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {filteredReviews.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-[#E8D5B5] p-5 sm:p-6 shadow-2xs hover:border-[#C58B55]/70 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                
                {/* Header: User Info & Rating */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Initial Avatar */}
                    <div className="w-10 h-10 rounded-full bg-[#F5E6C8] text-[#70412E] font-heading font-black text-sm flex items-center justify-center shrink-0 border border-[#E8D5B5]">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-sm text-[#70412E] leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-[#806B58] font-medium">
                        {item.roleOrAffiliation || 'Pelanggan'}
                      </p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= item.rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Menu Tag */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFFAF1] border border-[#E8D5B5] text-[11px] font-bold text-[#78804B]">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{item.menuBought}</span>
                </div>

                {/* Comment Text */}
                <p className="text-xs sm:text-sm text-[#70412E] leading-relaxed">
                  &ldquo;{item.comment}&rdquo;
                </p>

                {/* Suggestion Box if provided */}
                {item.suggestion && (
                  <div className="p-3 rounded-xl bg-[#F5E6C8]/40 border border-[#E8D5B5]/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-[#C58B55] uppercase tracking-wide">
                      <Lightbulb className="w-3.5 h-3.5 text-[#C58B55] shrink-0" />
                      <span>Kritik &amp; Saran Pelanggan:</span>
                    </div>
                    <p className="text-xs text-[#806B58] italic leading-normal">
                      {item.suggestion}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer: Date & Verified Stamp */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#806B58]">
                <span>{item.date}</span>
                <span className="flex items-center gap-1 font-semibold text-[#78804B]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ulasan Terverifikasi</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state if filtered results are 0 */}
        {filteredReviews.length === 0 && (
          <div className="text-center py-12 px-4 bg-white rounded-2xl border border-[#E8D5B5] space-y-2">
            <p className="font-heading font-black text-[#70412E]">Belum ada ulasan untuk kategori ini</p>
            <p className="text-xs text-[#806B58]">Jadilah yang pertama menulis ulasan untuk kategori ini!</p>
          </div>
        )}

      </div>

      {/* Review Submission Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReviewAdded={newReviews => onReviewAdded(newReviews)}
        storeConfig={storeConfig}
      />
    </section>
  );
};
