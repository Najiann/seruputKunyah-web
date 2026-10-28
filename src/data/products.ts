/**
 * ============================================================================
 * SINGLE SOURCE OF TRUTH (RE-EXPORT / COMPATIBILITY ADAPTER)
 * ============================================================================
 * File ini meneruskan data master dari src/services/productService.ts
 * untuk memastikan kompatibilitas penuh dengan kode yang sudah ada, sekaligus
 * menyediakan getter dinamis agar harga selalu mutakhir.
 */

import {
  INITIAL_PRODUCTS,
  INITIAL_BUNDLES,
  getStoredProducts,
  calculateBundles,
  calculateLowestPrice,
  getAllMenuNames,
} from '../services/productService';

export const PRODUCTS = INITIAL_PRODUCTS;
export const BUNDLE_ITEMS = INITIAL_BUNDLES;
export const BUNDLES_ENABLED = true;

export {
  getStoredProducts,
  calculateBundles,
  calculateLowestPrice,
  getAllMenuNames,
};
