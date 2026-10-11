/**
 * Format number into Indonesian Rupiah currency string
 * Example: 8000 -> "Rp8.000"
 */
export function formatRupiah(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'Rp0';
  }
  return 'Rp' + amount.toLocaleString('id-ID');
}
