import React, { useMemo, useState } from 'react';
import { Search, Eye, X, AlertCircle, RotateCcw } from 'lucide-react';
import { PaymentMethod, TransactionRecord, TransactionStatus } from '../../types';
import { useAdminAuth } from './AdminAuthContext';
import { cancelOrRefundTransaction } from '../../services/adminBackendService';
import { formatRupiah } from '../../utils/currency';

interface AdminTransactionsViewProps {
  transactions: TransactionRecord[];
  loading: boolean;
  onRefresh: () => Promise<void>;
}

const STATUS_LABELS: Record<TransactionStatus, { label: string; color: string }> = {
  completed: { label: 'Selesai', color: 'text-[#16A34A]' },
  cancelled: { label: 'Dibatalkan', color: 'text-[#DC2626]' },
  refunded: { label: 'Refund', color: 'text-[#D97706]' },
};

export const AdminTransactionsView: React.FC<AdminTransactionsViewProps> = ({
  transactions,
  loading,
  onRefresh,
}) => {
  const { profile } = useAdminAuth();
  const isAdmin = profile?.role === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TransactionStatus>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | PaymentMethod>('all');
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);

  // Refund / Cancel Form inside modal
  const [voidActionStatus, setVoidActionStatus] = useState<'cancelled' | 'refunded'>('cancelled');
  const [voidReason, setVoidReason] = useState('');
  const [isProcessingVoid, setIsProcessingVoid] = useState(false);
  const [voidError, setVoidError] = useState<string | null>(null);
  const [bannerSuccess, setBannerSuccess] = useState<string | null>(null);

  const filteredTx = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return transactions.filter((tx) => {
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      if (methodFilter !== 'all' && tx.payment_method !== methodFilter) return false;
      if (
        q &&
        !tx.transaction_number.toLowerCase().includes(q) &&
        !(tx.created_by_name || '').toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [transactions, statusFilter, methodFilter, searchQuery]);

  const openDetailModal = (tx: TransactionRecord) => {
    setSelectedTx(tx);
    setVoidActionStatus('cancelled');
    setVoidReason('');
    setVoidError(null);
  };

  const handleVoidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedTx) return;
    setVoidError(null);
    setIsProcessingVoid(true);
    try {
      await cancelOrRefundTransaction(
        {
          transaction_id: selectedTx.id,
          new_status: voidActionStatus,
          reason: voidReason,
        },
        profile
      );
      setBannerSuccess(
        `Transaksi ${selectedTx.transaction_number} diubah ke ${voidActionStatus === 'refunded' ? 'Refund' : 'Dibatalkan'} dan stok telah dikembalikan.`
      );
      setSelectedTx(null);
      await onRefresh();
    } catch (err) {
      setVoidError(err instanceof Error ? err.message : 'Gagal memperbarui status transaksi.');
    } finally {
      setIsProcessingVoid(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#C7320B] tracking-tight">
          Riwayat Transaksi
        </h1>
        <p className="text-xs sm:text-sm text-[#6E2C1B] mt-0.5">
          Daftar transaksi tersimpan beserta snapshot nama &amp; harga item saat transaksi berlangsung.
        </p>
      </div>

      {bannerSuccess && (
        <div className="p-3.5 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/30 text-xs font-semibold text-[#16A34A] flex items-center justify-between gap-2">
          <span>{bannerSuccess}</span>
          <button type="button" onClick={() => setBannerSuccess(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6E2C1B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari no. transaksi atau nama kasir..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#EAD29C] rounded-xl text-[#3E1004] focus:outline-none focus:ring-2 focus:ring-[#FF8234]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | TransactionStatus)}
            className="px-3 py-2 text-xs font-bold bg-white border border-[#EAD29C] rounded-xl text-[#3E1004]"
          >
            <option value="all">Semua Status</option>
            <option value="completed">Selesai (completed)</option>
            <option value="cancelled">Dibatalkan (cancelled)</option>
            <option value="refunded">Refund (refunded)</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as 'all' | PaymentMethod)}
            className="px-3 py-2 text-xs font-bold bg-white border border-[#EAD29C] rounded-xl text-[#3E1004]"
          >
            <option value="all">Semua Metode</option>
            <option value="cash">Tunai (cash)</option>
            <option value="qris">QRIS</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#6E2C1B]">Memuat transaksi...</div>
        ) : filteredTx.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#6E2C1B] space-y-1">
            <p className="font-bold text-[#C7320B]">Belum ada transaksi yang cocok</p>
            <p>Simpan transaksi melalui menu Kasir POS agar tercatat di sini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5E7B8]/50 border-b border-[#EAD29C] text-[#6E2C1B] font-bold">
                <tr>
                  <th className="py-3 px-4">No. Transaksi</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Kasir</th>
                  <th className="py-3 px-4 text-right">Item</th>
                  <th className="py-3 px-4">Pembayaran</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAD29C]/60">
                {filteredTx.map((tx) => {
                  const totalQty = tx.items.reduce((sum, it) => sum + it.quantity, 0);
                  const statusMeta = STATUS_LABELS[tx.status];
                  return (
                    <tr key={tx.id} className="hover:bg-[#FCF6E0]/60 transition-colors">
                      <td className="py-3 px-4 font-mono tabular-nums font-bold text-[#C7320B] whitespace-nowrap">
                        {tx.transaction_number}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-[#6E2C1B] whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 text-[#3E1004] whitespace-nowrap">
                        {tx.created_by_name || 'Kasir'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-[#3E1004]">
                        {totalQty}
                      </td>
                      <td className="py-3 px-4 uppercase font-semibold text-[#3E1004] whitespace-nowrap">
                        {tx.payment_method} ·{' '}
                        <span className="text-[#6E2C1B]">
                          {tx.payment_status === 'paid'
                            ? 'Lunas'
                            : tx.payment_status === 'refunded'
                            ? 'Refund'
                            : 'Pending'}
                        </span>
                      </td>
                      <td className={`py-3 px-4 font-bold whitespace-nowrap ${statusMeta.color}`}>
                        {statusMeta.label}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-black text-[#C7320B] whitespace-nowrap">
                        {formatRupiah(tx.grand_total)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openDetailModal(tx)}
                          className="px-2.5 py-1.5 bg-white border border-[#EAD29C] hover:border-[#FF8234] text-[#C7320B] font-bold rounded-lg inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div
            onClick={() => setSelectedTx(null)}
            className="fixed inset-0 bg-[#3E1004]/50 backdrop-blur-xs"
          />
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-[#EAD29C]">
                <div>
                  <h2 className="font-heading text-lg font-black text-[#C7320B]">
                    Detail Transaksi
                  </h2>
                  <p className="font-mono tabular-nums text-xs font-bold text-[#6E2C1B]">
                    {selectedTx.transaction_number}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTx(null)}
                  className="p-1 text-[#6E2C1B] hover:text-[#C7320B] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs bg-[#FCF6E0] border border-[#EAD29C] rounded-xl p-3.5">
                <div>
                  <span className="text-[#6E2C1B] block">Waktu Transaksi</span>
                  <strong className="font-mono tabular-nums text-[#3E1004]">
                    {new Date(selectedTx.created_at).toLocaleString('id-ID')}
                  </strong>
                </div>
                <div>
                  <span className="text-[#6E2C1B] block">Petugas Kasir</span>
                  <strong className="text-[#3E1004]">
                    {selectedTx.created_by_name || 'Kasir'}
                  </strong>
                </div>
                <div>
                  <span className="text-[#6E2C1B] block">Metode &amp; Bayar</span>
                  <strong className="uppercase text-[#3E1004]">
                    {selectedTx.payment_method} · {selectedTx.payment_status}
                  </strong>
                </div>
                <div>
                  <span className="text-[#6E2C1B] block">Status Transaksi</span>
                  <strong className={STATUS_LABELS[selectedTx.status].color}>
                    {STATUS_LABELS[selectedTx.status].label}
                  </strong>
                </div>
                <div className="col-span-2 pt-1 border-t border-[#EAD29C]/70">
                  <span className="text-[#6E2C1B] block">Idempotency Key</span>
                  <code className="font-mono text-[11px] text-[#3E1004] break-all">
                    {selectedTx.idempotency_key}
                  </code>
                </div>
              </div>

              {/* Items Snapshot Table */}
              <div className="border border-[#EAD29C] rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5E7B8]/50 border-b border-[#EAD29C] text-[#6E2C1B] font-bold">
                    <tr>
                      <th className="py-2 px-3">Produk (Snapshot)</th>
                      <th className="py-2 px-3 text-right">Harga</th>
                      <th className="py-2 px-3 text-right">Qty</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAD29C]/60">
                    {selectedTx.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 px-3 font-bold text-[#3E1004]">
                          {item.product_name_snapshot}
                        </td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums text-[#6E2C1B]">
                          {formatRupiah(item.unit_price_snapshot)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums text-[#3E1004]">
                          {item.quantity}
                        </td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums font-bold text-[#3E1004]">
                          {formatRupiah(item.line_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="space-y-1 text-xs pt-1">
                <div className="flex justify-between text-[#6E2C1B]">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums font-bold">
                    {formatRupiah(selectedTx.subtotal)}
                  </span>
                </div>
                {selectedTx.discount_total > 0 && (
                  <div className="flex justify-between text-[#16A34A]">
                    <span>Diskon</span>
                    <span className="font-mono tabular-nums font-bold">
                      -{formatRupiah(selectedTx.discount_total)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-[#C7320B] pt-1.5 border-t border-[#EAD29C]">
                  <span>Grand Total</span>
                  <span className="font-mono tabular-nums">
                    {formatRupiah(selectedTx.grand_total)}
                  </span>
                </div>
              </div>

              {/* Admin-only Cancel / Refund */}
              {isAdmin && selectedTx.status === 'completed' && (
                <form
                  onSubmit={(e) => void handleVoidSubmit(e)}
                  className="pt-3 border-t border-[#EAD29C] space-y-2.5"
                >
                  <p className="text-xs font-black text-[#C7320B] flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Batalkan / Refund Transaksi (Khusus Admin)</span>
                  </p>
                  <p className="text-[11px] text-[#6E2C1B]">
                    Aksi ini mengembalikan stok seluruh item ke inventori dan mencatat mutasi{' '}
                    <code className="font-mono">return</code>.
                  </p>

                  {voidError && (
                    <div className="p-2.5 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 text-xs font-semibold text-[#DC2626] flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{voidError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                      value={voidActionStatus}
                      onChange={(e) =>
                        setVoidActionStatus(e.target.value as 'cancelled' | 'refunded')
                      }
                      className="px-2.5 py-2 text-xs font-bold bg-white border border-[#EAD29C] rounded-xl text-[#3E1004]"
                    >
                      <option value="cancelled">Batalkan</option>
                      <option value="refunded">Refund</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={voidReason}
                      onChange={(e) => setVoidReason(e.target.value)}
                      placeholder="Alasan wajib (mis: salah input)"
                      className="sm:col-span-2 px-3 py-2 text-xs bg-white border border-[#EAD29C] rounded-xl text-[#3E1004]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessingVoid}
                    className="w-full py-2 bg-[#DC2626] hover:bg-[#B91C1C] disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    {isProcessingVoid
                      ? 'Memproses...'
                      : voidActionStatus === 'refunded'
                      ? 'Konfirmasi Refund & Kembalikan Stok'
                      : 'Konfirmasi Pembatalan & Kembalikan Stok'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
