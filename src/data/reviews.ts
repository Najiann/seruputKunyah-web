import { CustomerReview } from '../types';

export const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    name: 'Nabila Putri',
    roleOrAffiliation: 'Mahasiswi FEB',
    rating: 5,
    menuBought: 'Makaroni Basah (Level 2) + Es Teh',
    comment: 'Makaroninya lembut kenyal, bumbu cabai dan bawangnya nendang banget! Es tehnya juga wangi melati asli, seger banget diminum siang-siang pas abis kelas.',
    suggestion: 'Porsinya pas banget buat ngemil, kalau bisa nanti ada opsi tambah topping sosis atau keju ya min!',
    date: '12 Okt 2026',
    isVerified: true,
  },
  {
    id: 'rev-2',
    name: 'Dimas Prasetyo',
    roleOrAffiliation: 'Anak Kosan Sebelah Kampus',
    rating: 5,
    menuBought: 'Makaroni Kering (Level 3)',
    comment: 'Kriuknya tahan lama, gak bikin tenggorokan serak. Daun jeruknya berasa banget, wajib beli buat nemenin nugas begadang.',
    suggestion: 'Bumbu cabainya tolong pertahankan resep yang ini ya, pedas gurihnya pas pol.',
    date: '11 Okt 2026',
    isVerified: true,
  },
  {
    id: 'rev-3',
    name: 'Siti Rahma',
    roleOrAffiliation: 'Fakultas Ilmu Budaya',
    rating: 4,
    menuBought: 'Paket Kombo Segar (Makaroni + Es Teh Lemon)',
    comment: 'Perpaduan makaroni pedas sama es teh lemonnya beneran juara. Asam manisnya seger langsung ngilangin rasa pedas di lidah.',
    suggestion: 'Saran sedikit, kalau bisa sendok atau tusukannya disediakan dua kalau pesen buat bareng temen hehe.',
    date: '09 Okt 2026',
    isVerified: true,
  },
  {
    id: 'rev-4',
    name: 'Rian Firdaus',
    roleOrAffiliation: 'Sobat Nugas Perpus',
    rating: 5,
    menuBought: 'Makaroni Basah Gurih Original',
    comment: 'Buat yang ga kuat pedas kaya aku, versi original gurihnya enak parah. Rasa bawang putih dan aromanya kerasa.',
    suggestion: 'Pengantarannya ke gedung fakultas cepet banget, respon admin WA juga ramah!',
    date: '08 Okt 2026',
    isVerified: true,
  },
];

const STORAGE_KEY = 'seruput_kunyah_reviews_v1';

export function getCustomerReviews(): CustomerReview[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as CustomerReview[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Gagal membaca ulasan dari localStorage', err);
  }
  return INITIAL_REVIEWS;
}

export function addCustomerReview(review: Omit<CustomerReview, 'id' | 'date'>): CustomerReview[] {
  const current = getCustomerReviews();
  const newEntry: CustomerReview = {
    ...review,
    id: `rev-${Date.now()}`,
    date: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    isVerified: true,
  };

  const updated = [newEntry, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Gagal menyimpan ulasan ke localStorage', err);
  }
  return updated;
}
