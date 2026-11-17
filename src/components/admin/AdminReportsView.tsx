import React, { useMemo, useState } from 'react';
import { Download, ShieldAlert } from 'lucide-react';
import { PaymentMethod, TransactionRecord } from '../../types';
import { useAdminAuth } from './AdminAuthContext';
import { formatRupiah } from '../../utils/currency';

interface AdminReportsViewProps {
  transactions: TransactionRecord[];
  loading: boolean;
}

function toInputDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const AdminReportsView: React.FC<AdminReportsViewProps> = ({ transactions, loading }) => {
  const { profile } = useAdminAuth();

  const today = useMemo(() => new Date(), []);
  const sevenDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d;
  }, []);

  const [startDate, setStartDate] = useState<string>(() => toInputDate(sevenDaysAgo));
  const [endDate, setEndDate] = useState<string>(() => toInputDate(today));

  if (profile?.role !== 'admin') {
    return (
      <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-8 text-center max-w-lg mx-auto space-y-3">
        <div className="w-12 h-12 rounded-xl bg-[#DC2626]/10 text-[#DC2626] mx-auto flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="font-heading text-lg font-black text-[#C7320B]">Akses Terbatas</h2>
        <p className="text-xs text-[#6E2C1B]">
          Halaman Laporan Penjualan hanya dapat diakses oleh pengguna dengan role <strong>admin</strong>.
        </p>
      </div>
    );
  }

  const applyPreset = (preset: 'today' | '7d' | 'month' | 'all') => {
    const now = new Date();
    if (preset === 'today') {
      const s = toInputDate(now);
      setStartDate(s);
      setEndDate(s);
    } else if (preset === '7d') {
      const s = new Date(now);
      s.setDate(s.getDate() - 6);
      setStartDate(toInputDate(s));
      setEndDate(toInputDate(now));
    } else if (preset === 'month') {
      const s = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(toInputDate(s));
      setEndDate(toInputDate(now));
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const rangeTransactions = useMemo(() => {
    const startMs = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null;
    const endMs = endDate ? new Date(`${endDate}T23:59:59.999`).getTime() : null;

    return transactions.filter((tx) => {
      const ts = new Date(tx.created_at).getTime();
      if (startMs !== null && ts < startMs) return false;
      if (endMs !== null && ts > endMs) return false;
      return true;
    });
  }, [transactions, startDate, endDate]);

  const completedTx = useMemo(
    () => rangeTransactions.filter((tx) => tx.status === 'completed'),
    [rangeTransactions]
  );

  const voidTxCount = useMemo(
    () => rangeTransactions.filter((tx) => tx.status !== 'completed').length,
    [rangeTransactions]
  );

  const summary = useMemo(() => {
    const totalSales = completedTx.reduce((s, tx) => s + tx.grand_total, 0);
    const totalDiscount = completedTx.reduce((s, tx) => s + tx.discount_total, 0);
    const totalUnits = completedTx.reduce(
      (s, tx) => s + tx.items.reduce((acc, it) => acc + it.quantity, 0),
      0
    );
    return {
      txCount: completedTx.length,
      totalSales,
      totalDiscount,
      totalUnits,
    };
  }, [completedTx]);

  const paymentBreakdown = useMemo(() => {
    const methods: PaymentMethod[] = ['cash', 'qris', 'transfer'];
    return methods.map((m) => {
      const list = completedTx.filter((tx) => tx.payment_method === m);
      return {
        method: m,
        count: list.length,
        total: list.reduce((s, tx) => s + tx.grand_total, 0),
      };
    });
  }, [completedTx]);

  const soldProducts = useMemo(() => {
    const map: Record<
      string,
      {
        key: string;
        productName: string;
        quantity: number;
        revenue: number;
      }
    > = {};

    completedTx.forEach((tx) => {
      tx.items.forEach((it) => {
        const key = `${it.product_id}::${it.product_name_snapshot}`;
        if (!map[key]) {
          map[key] = {
            key,
            productName: it.product_name_snapshot,
            quantity: 0,
            revenue: 0,
          };
        }
        map[key].quantity += it.quantity;
        map[key].revenue += it.line_total;
      });
    });

    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [completedTx]);

  const handleDownloadCsv = () => {
    const escapeCsv = (val: string | number) => {
      const s = String(val);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const lines: string[] = [
      'No Transaksi,Waktu,Kasir,Metode,Status Pembayaran,Status Transaksi,Subtotal,Diskon,Grand Total',
      ...rangeTransactions.map((tx) =>
        [
          escapeCsv(tx.transaction_number),
          escapeCsv(new Date(tx.created_at).toISOString()),
          escapeCsv(tx.created_by_name || 'Kasir'),
          escapeCsv(tx.payment_method),
          escapeCsv(tx.payment_status),
          escapeCsv(tx.status),
          tx.subtotal,
          tx.discount_total,
          tx.grand_total,
        ].join(',')
      ),
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-seruput-kunyah-${startDate || 'awal'}_${endDate || 'akhir'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#C7320B] tracking-tight">
            Laporan Penjualan
          </h1>
          <p className="text-xs sm:text-sm text-[#6E2C1B] mt-0.5">
            Seluruh angka berasal langsung dari transaksi tersimpan pada database, bukan data contoh statis.
          </p>
        </div>

        <button
          type="button"
          disabled={rangeTransactions.length === 0}
          onClick={handleDownloadCsv}
          className="px-4 py-2 bg-[#C7320B] hover:bg-[#A12606] disabled:opacity-50 text-white text-xs font-bold rounded-xl inline-flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Unduh CSV</span>
        </button>
      </div>

      {/* Date Range Filters */}
      <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="inline-flex p-1 bg-[#F5E7B8]/70 border border-[#EAD29C] rounded-xl gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => applyPreset('today')}
            className="px-3 py-1.5 text-xs font-bold text-[#6E2C1B] hover:text-[#C7320B] rounded-lg cursor-pointer"
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => applyPreset('7d')}
            className="px-3 py-1.5 text-xs font-bold text-[#6E2C1B] hover:text-[#C7320B] rounded-lg cursor-pointer"
          >
            7 Hari
          </button>
          <button
            type="button"
            onClick={() => applyPreset('month')}
            className="px-3 py-1.5 text-xs font-bold text-[#6E2C1B] hover:text-[#C7320B] rounded-lg cursor-pointer"
          >
            Bulan Ini
          </button>
          <button
            type="button"
            onClick={() => applyPreset('all')}
            className="px-3 py-1.5 text-xs font-bold text-[#6E2C1B] hover:text-[#C7320B] rounded-lg cursor-pointer"
          >
            Semua Waktu
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <label className="font-bold text-[#6E2C1B]">Dari</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-[#EAD29C] rounded-xl text-[#3E1004] font-mono tabular-nums"
          />
          <label className="font-bold text-[#6E2C1B]">Sampai</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-[#EAD29C] rounded-xl text-[#3E1004] font-mono tabular-nums"
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-5 space-y-1">
          <p className="text-xs font-semibold text-[#6E2C1B]">Total Penjualan Bersih</p>
          <p className="font-mono tabular-nums text-2xl font-black text-[#C7320B]">
            {formatRupiah(summary.totalSales)}
          </p>
          <p className="text-xs text-[#6E2C1B]">Dari transaksi berstatus selesai</p>
        </div>

        <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-5 space-y-1">
          <p className="text-xs font-semibold text-[#6E2C1B]">Jumlah Transaksi Selesai</p>
          <p className="font-mono tabular-nums text-2xl font-black text-[#C7320B]">
            {summary.txCount}
          </p>
          <p className="text-xs text-[#6E2C1B] font-mono tabular-nums">
            {summary.totalUnits} total item terjual
          </p>
        </div>

        <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-5 space-y-1">
          <p className="text-xs font-semibold text-[#6E2C1B]">Total Diskon Diberikan</p>
          <p className="font-mono tabular-nums text-2xl font-black text-[#3E1004]">
            {formatRupiah(summary.totalDiscount)}
          </p>
          <p className="text-xs text-[#6E2C1B]">Potongan harga pada POS</p>
        </div>

        <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-5 space-y-1">
          <p className="text-xs font-semibold text-[#6E2C1B]">Transaksi Batal / Refund</p>
          <p className="font-mono tabular-nums text-2xl font-black text-[#D97706]">
            {voidTxCount}
          </p>
          <p className="text-xs text-[#6E2C1B]">Dikecualikan dari omzet</p>
        </div>
      </div>

      {/* Payment Breakdown & Sold Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-4 bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EAD29C]">
            <h2 className="font-heading font-black text-base text-[#C7320B]">
              Per Metode Pembayaran
            </h2>
          </div>
          <div className="divide-y divide-[#EAD29C]/60">
            {paymentBreakdown.map((row) => (
              <div key={row.method} className="px-5 py-3.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold uppercase text-[#3E1004]">{row.method}</p>
                  <p className="text-[#6E2C1B] font-mono tabular-nums">{row.count} transaksi</p>
                </div>
                <p className="font-mono tabular-nums font-black text-sm text-[#C7320B]">
                  {formatRupiah(row.total)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-8 bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EAD29C]">
            <h2 className="font-heading font-black text-base text-[#C7320B]">
              Daftar Produk Terjual
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#6E2C1B]">Menghitung laporan...</div>
          ) : soldProducts.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6E2C1B]">
              Belum ada produk terjual pada rentang tanggal ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5E7B8]/50 border-b border-[#EAD29C] text-[#6E2C1B] font-bold">
                  <tr>
                    <th className="py-3 px-4">Nama Produk (Snapshot)</th>
                    <th className="py-3 px-4 text-right">Qty Terjual</th>
                    <th className="py-3 px-4 text-right">Total Penjualan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAD29C]/60">
                  {soldProducts.map((item) => (
                    <tr key={item.key} className="hover:bg-[#FCF6E0]/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#3E1004]">{item.productName}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-[#3E1004]">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-black text-[#C7320B]">
                        {formatRupiah(item.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
