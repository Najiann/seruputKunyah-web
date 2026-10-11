import { StoreConfig } from '../types';

export const DEFAULT_STORE_CONFIG: StoreConfig = {
  // IMPORTANT: Placeholder configuration for student entrepreneurs.
  // Replace with the real business phone number when live (e.g., '6281234567890')
  whatsappNumber: '6285180604131',
  whatsappDisplay: '+62 851-8060-4131',
  instagramHandle: '@seruputkunyah',
  instagramUrl: 'https://www.instagram.com/seruputkunyah',
  campusArea: 'Area Sekitar Kampus & Kos Mahasiswa (COD / Antar)',
  operationalHours: 'Senin – Sabtu, 10.00 – 19.30 WIB',
  brandTagline: 'Seruput Segar, Kunyah Lezat',
};

const STORAGE_KEY = 'seruput_kunyah_config_v3';

export function getStoreConfig(): StoreConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_STORE_CONFIG, ...JSON.parse(saved) };
    }
  } catch (err) {
    console.warn('Failed to load store config from localStorage', err);
  }
  return DEFAULT_STORE_CONFIG;
}

export function saveStoreConfig(config: Partial<StoreConfig>): StoreConfig {
  const current = getStoreConfig();
  const updated = { ...current, ...config };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save store config', err);
  }
  return updated;
}
