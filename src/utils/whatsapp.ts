import { CartItem } from '../types';
import { formatRupiah } from './currency';

/**
 * Generates formatted WhatsApp order message following the exact brand specification:
 * 
 * Halo SERUPUT & KUNYAH! Saya ingin memesan:
 * 
 * 1. Makaroni Kering x 2
 *    Harga satuan: Rp8.000
 *    Subtotal: Rp16.000
 * 
 * Total sementara: Rp16.000
 * 
 * Catatan: Level pedas sedang
 * 
 * Mohon konfirmasi ketersediaan produk, ongkos kirim jika berlaku, dan metode pembayaran.
 * 
 * Terima kasih!
 */
export function buildWhatsAppMessage(
  items: CartItem[],
  customerNote: string = '',
  customerName: string = ''
): string {
  if (!items || items.length === 0) {
    return '';
  }

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const lines: string[] = [];
  lines.push('Halo SERUPUT & KUNYAH! Saya ingin memesan:\n');

  if (customerName && customerName.trim()) {
    lines.push(`Nama Pemesan: ${customerName.trim()}\n`);
  }

  items.forEach((item, index) => {
    const itemSubtotal = item.product.price * item.quantity;
    lines.push(
      `${index + 1}. ${item.product.name} x ${item.quantity}`
    );
    lines.push(`   Harga satuan: ${formatRupiah(item.product.price)}`);
    lines.push(`   Subtotal: ${formatRupiah(itemSubtotal)}`);
    if (item.notes && item.notes.trim()) {
      lines.push(`   Varian/Rasa: ${item.notes.trim()}`);
    }
    lines.push(''); // blank line between items
  });

  lines.push(`Total sementara: ${formatRupiah(total)}\n`);

  if (customerNote && customerNote.trim()) {
    lines.push(`Catatan: ${customerNote.trim()}\n`);
  }

  lines.push('Mohon konfirmasi ketersediaan produk, ongkos kirim jika berlaku, dan metode pembayaran.\n');
  lines.push('Terima kasih!');

  return lines.join('\n');
}

/**
 * Builds the WhatsApp direct chat link
 */
export function getWhatsAppOrderUrl(
  phoneNumber: string,
  items: CartItem[],
  customerNote: string = '',
  customerName: string = ''
): string {
  // Clean phone number (remove +, -, spaces)
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const message = buildWhatsAppMessage(items, customerNote, customerName);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanNumber}?text=${encodedText}`;
}
