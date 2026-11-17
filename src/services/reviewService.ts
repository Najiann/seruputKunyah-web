import { ensureSupabaseClient } from '../lib/supabase';
import { CustomerReview, Profile } from '../types';
import { addCustomerReview, getCustomerReviews } from '../data/reviews';

const LOCAL_STORAGE_KEY = 'seruput_kunyah_reviews_v1';

interface RawReviewRow {
  id: string;
  customer_name: string;
  role_or_affiliation: string | null;
  rating: number;
  menu_bought: string;
  comment: string;
  suggestion: string | null;
  is_published: boolean;
  is_verified: boolean;
  created_at: string;
}

function formatReviewDate(isoDate: string): string {
  try {
    return new Date(isoDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function mapRowToReview(row: RawReviewRow): CustomerReview {
  return {
    id: String(row.id),
    name: String(row.customer_name),
    roleOrAffiliation: row.role_or_affiliation || 'Pelanggan',
    rating: Number(row.rating) || 5,
    menuBought: String(row.menu_bought),
    comment: String(row.comment),
    suggestion: row.suggestion?.trim() ? row.suggestion : undefined,
    date: formatReviewDate(row.created_at),
    createdAt: row.created_at,
    isVerified: Boolean(row.is_verified),
    isPublished: Boolean(row.is_published),
  };
}

function saveLocalReviews(reviews: CustomerReview[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
  } catch {
    // ignore storage quota errors
  }
}

/**
 * Fetch published customer reviews for the public storefront.
 * Reads live from Supabase `public.reviews` when configured; falls back gracefully
 * if the table hasn't been created yet or when running in local sandbox mode.
 */
export async function fetchPublicReviews(): Promise<{
  reviews: CustomerReview[];
  source: 'supabase' | 'local';
}> {
  const supabase = await ensureSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('reviews')
      .select(
        'id, customer_name, role_or_affiliation, rating, menu_bought, comment, suggestion, is_published, is_verified, created_at'
      )
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && Array.isArray(data)) {
      return {
        reviews: (data as RawReviewRow[]).map(mapRowToReview),
        source: 'supabase',
      };
    }
  }

  return {
    reviews: getCustomerReviews().filter((r) => r.isPublished !== false),
    source: 'local',
  };
}

export interface SubmitReviewInput {
  name: string;
  roleOrAffiliation: string;
  rating: number;
  menuBought: string;
  comment: string;
  suggestion?: string;
}

/**
 * Save a new customer review from the public website into Supabase `public.reviews`
 * (or localStorage if Supabase/table is unavailable).
 */
export async function submitPublicReview(input: SubmitReviewInput): Promise<{
  reviews: CustomerReview[];
  savedToSupabase: boolean;
}> {
  const name = input.name.trim();
  const roleOrAffiliation = input.roleOrAffiliation.trim() || 'Pelanggan';
  const menuBought = input.menuBought.trim();
  const comment = input.comment.trim();
  const suggestion = (input.suggestion || '').trim();
  const rating = Math.min(5, Math.max(1, Math.round(Number(input.rating) || 5)));

  if (name.length < 2) {
    throw new Error('Nama minimal 2 karakter.');
  }
  if (!menuBought) {
    throw new Error('Pilih minimal satu menu yang dipesan.');
  }
  if (comment.length < 3) {
    throw new Error('Ulasan minimal 3 karakter.');
  }

  const supabase = await ensureSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from('reviews').insert({
      customer_name: name,
      role_or_affiliation: roleOrAffiliation,
      rating,
      menu_bought: menuBought,
      comment,
      suggestion,
      is_published: true,
      is_verified: true,
    });

    if (!error) {
      const latest = await fetchPublicReviews();
      return {
        reviews: latest.reviews,
        savedToSupabase: true,
      };
    }

    // If table hasn't been migrated yet (PGRST205 / 42P01), fall back cleanly so UX doesn't crash
    const errCode = (error as { code?: string }).code || '';
    if (errCode !== 'PGRST205' && errCode !== '42P01') {
      throw new Error(error.message || 'Gagal menyimpan ulasan ke database.');
    }
  }

  const updated = addCustomerReview({
    name,
    roleOrAffiliation,
    rating,
    menuBought,
    comment,
    suggestion: suggestion || undefined,
    isPublished: true,
  });

  return {
    reviews: updated,
    savedToSupabase: false,
  };
}

/**
 * Admin / Staff: list ALL reviews (including hidden/unpublished) from Supabase or local sandbox.
 */
export async function listAdminReviews(): Promise<{
  reviews: CustomerReview[];
  tableMissing: boolean;
}> {
  const supabase = await ensureSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from('reviews')
      .select(
        'id, customer_name, role_or_affiliation, rating, menu_bought, comment, suggestion, is_published, is_verified, created_at'
      )
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      const errCode = (error as { code?: string }).code || '';
      if (errCode === 'PGRST205' || errCode === '42P01') {
        return { reviews: [], tableMissing: true };
      }
      throw new Error(error.message);
    }

    return {
      reviews: ((data || []) as RawReviewRow[]).map(mapRowToReview),
      tableMissing: false,
    };
  }

  return {
    reviews: getCustomerReviews().map((r) => ({ ...r, isPublished: r.isPublished !== false })),
    tableMissing: false,
  };
}

/**
 * Admin only: show or hide a review on the public website.
 */
export async function toggleReviewPublished(
  reviewId: string,
  nextPublished: boolean,
  actor: Profile
): Promise<void> {
  if (actor.role !== 'admin') {
    throw new Error('Akses ditolak: hanya admin yang dapat memoderasi ulasan.');
  }

  const supabase = await ensureSupabaseClient();
  if (supabase) {
    const { error } = await supabase
      .from('reviews')
      .update({ is_published: nextPublished })
      .eq('id', reviewId);
    if (error) throw new Error(error.message);
    return;
  }

  const list = getCustomerReviews();
  const updated = list.map((r) =>
    r.id === reviewId ? { ...r, isPublished: nextPublished } : r
  );
  saveLocalReviews(updated);
}

/**
 * Admin only: permanently delete a review (e.g. spam).
 */
export async function deleteAdminReview(reviewId: string, actor: Profile): Promise<void> {
  if (actor.role !== 'admin') {
    throw new Error('Akses ditolak: hanya admin yang dapat menghapus ulasan.');
  }

  const supabase = await ensureSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    if (error) throw new Error(error.message);
    return;
  }

  const list = getCustomerReviews();
  const updated = list.filter((r) => r.id !== reviewId);
  saveLocalReviews(updated);
}
