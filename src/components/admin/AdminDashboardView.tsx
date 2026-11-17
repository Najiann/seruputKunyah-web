import React, { useMemo, useState } from 'react';
import {
  ShoppingCart,
  Package,
  ReceiptText,
  BarChart3,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { AdminProduct, TransactionRecord } from '../../types';
import { AdminTab } from './AdminLayout';
import { useAdminAuth } from './AdminAuthContext';
import { formatRupiah } from '../../utils/currency';

interface AdminDashboardViewProps {
  products: AdminProduct[];
  transactions: TransactionRecord[];
  loading: boolean;
  onRefresh: () => void;
  onNavigate: (tab: AdminTab) => void;
}

type PeriodFilter = 'today' | '7d' | '30d' | 'all';

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  products,
  transactions,
  loading,
  onRefresh,
  onNavigate,
}) => {
  const { profile } = useAdminAuth();
  const isAdmin = profile?.role === 'admin';
  const [period, setPeriod] = useState<PeriodFilter>('today');

  const filteredTx = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const ms7d = startOfToday - 6 * 24 * 60 * 60 * 1000;
    const ms30d = startOfToday - 29 * 24 * 60 * 60 * 1000;

    return transactions.filter((tx) => {
      if (tx.status !== 'completed') return false;
      const ts = new Date(tx.created_at).getTime();
      if (period === 'today') return ts >= startOfToday;
      if (period === '7d') return ts >= ms7d;
      if (period === '30d') return ts >= ms30d;
      return true;
    });
  }, [transactions, period]);

  const metrics = useMemo(() => {
    const revenue = filteredTx.reduce((acc, tx) => acc + tx.grand_total, 0);
    const itemsSold = filteredTx.reduce(
      (acc, tx) => acc + tx.items.reduce((s, it) => s + it.quantity, 0),
      0
    );
    const avgOrder = filteredTx.length > 0 ? Math.round(revenue / filteredTx.length) : 0;
    return {
      txCount: filteredTx.length,
      revenue,
      itemsSold,
      avgOrder,
    };
  }, [filteredTx]);

  const stockAlerts = useMemo(() => {
    return products
      .filter((p) => p.is_active && p.quantity_on_hand <= 10)
      .sort((a, b) => a.quantity_on_hand - b.quantity_on_hand);
  }, [products]);

  const inactiveCount = useMemo(
    () => products.filter((p) => !p.is_active).length,
    [products]
  );

  const recentTx = useMemo(() => transactions.slice(0, 6), [transactions]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-[#F5E7B8]/70 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#C7320B] tracking-tight">
            Ringkasan Operasional
          </h1>
          <p className="text-xs sm:text-sm text-[#6E2C1B] mt-0.5">
            Pantau total transaksi, omzet periode, serta stok produk yang perlu diperhatikan.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex p-1 bg-[#F5E7B8]/70 border border-[#EAD29C] rounded-xl gap-1">
            {(
              [
                { id: 'today', label: 'Hari Ini' },
                { id: '7d', label: '7 Hari' },
                { id: '30d', label: '30 Hari' },
                { id: 'all', label: 'Semua' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPeriod(opt.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  period === opt.id
                    ? 'bg-[#C7320B] text-white'
                    : 'text-[#6E2C1B] hover:text-[#C7320B]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onRefresh}
            className="p-2 bg-[#FFFDF5] border border-[#EAD29C] hover:border-[#FF8234] text-[#C7320B] rounded-xl transition-colors cursor-pointer"
            title="Muat ulang data"
            aria-label="Muat ulang data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-5 space-y-1.5">
          <p className="text-xs font-semibold text-[#6E2C1B]">Total Omzet (Completed)</p>
          <p className="font-mono tabular-nums text-2xl font-black text-[#C7320B]">
            {formatRupiah(metrics.revenue)}
          </p>
          <p className="text-xs text-[#6E2C1B] font-mono tabular-nums">
            Rata-rata {formatRupiah(metrics.avgOrder)} / transaksi
          </p>
        </div>

        <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-5 space-y-1.5">
          <p className="text-xs font-semibold text-[#6E2C1B]">Total Transaksi Sukses</p>
          <p className="font-mono tabular-nums text-2xl font-black text-[#C7320B]">
            {metrics.txCount}
          </p>
          <p className="text-xs text-[#6E2C1B] font-mono tabular-nums">
            {metrics.itemsSold} porsi / item terjual
          </p>
        </div>

        <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-5 space-y-1.5">
          <p className="text-xs font-semibold text-[#6E2C1B]">Produk Aktif di Katalog</p>
          <p className="font-mono tabular-nums text-2xl font-black text-[#C7320B]">
            {products.filter((p) => p.is_active).length}
          </p>
          <p className="text-xs text-[#6E2C1B] font-mono tabular-nums">
            {inactiveCount} produk dinonaktifkan
          </p>
        </div>

        <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-5 space-y-1.5">
          <p className="text-xs font-semibold text-[#6E2C1B]">Stok Perlu Diperhatikan</p>
          <p
            className={`font-mono tabular-nums text-2xl font-black ${
              stockAlerts.length > 0 ? 'text-[#D97706]' : 'text-[#16A34A]'
            }`}
          >
            {stockAlerts.length}
          </p>
          <p className="text-xs text-[#6E2C1B]">
            {stockAlerts.length > 0 ? 'Menu aktif dengan stok <= 10' : 'Semua stok produk aktif aman'}
          </p>
        </div>
      </div>

      {/* Quick Navigation Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => onNavigate('pos')}
          className="text-left p-4 bg-[#FFFDF5] border border-[#EAD29C] hover:border-[#FF8234] rounded-2xl transition-colors flex items-center justify-between gap-3 cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-[#C7320B] text-white rounded-xl shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-[#C7320B] truncate">Buka Kasir POS</p>
              <p className="text-xs text-[#6E2C1B] truncate">Catat pesanan booth &amp; chat</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#C7320B] shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('products')}
          className="text-left p-4 bg-[#FFFDF5] border border-[#EAD29C] hover:border-[#FF8234] rounded-2xl transition-colors flex items-center justify-between gap-3 cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-[#F5E7B8] text-[#C7320B] rounded-xl shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-[#C7320B] truncate">Produk &amp; Stok</p>
              <p className="text-xs text-[#6E2C1B] truncate">Kelola harga &amp; inventori</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#C7320B] shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('transactions')}
          className="text-left p-4 bg-[#FFFDF5] border border-[#EAD29C] hover:border-[#FF8234] rounded-2xl transition-colors flex items-center justify-between gap-3 cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-[#F5E7B8] text-[#C7320B] rounded-xl shrink-0">
              <ReceiptText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-[#C7320B] truncate">Riwayat Transaksi</p>
              <p className="text-xs text-[#6E2C1B] truncate">Periksa detail &amp; struk</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#C7320B] shrink-0" />
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => onNavigate('reports')}
            className="text-left p-4 bg-[#FFFDF5] border border-[#EAD29C] hover:border-[#FF8234] rounded-2xl transition-colors flex items-center justify-between gap-3 cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 bg-[#F5E7B8] text-[#C7320B] rounded-xl shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-[#C7320B] truncate">Laporan Penjualan</p>
                <p className="text-xs text-[#6E2C1B] truncate">Rekap per tanggal &amp; CSV</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#C7320B] shrink-0" />
          </button>
        )}
      </div>

      {/* Main Split: Stock Attention & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Inventory Watchlist */}
        <section className="lg:col-span-5 bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EAD29C] flex items-center justify-between">
            <h2 className="font-heading font-black text-base text-[#C7320B]">
              Inventori &amp; Stok Produk
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('products')}
              className="text-xs font-bold text-[#C7320B] hover:underline cursor-pointer"
            >
              Kelola Stok
            </button>
          </div>

          <div className="divide-y divide-[#EAD29C]/60">
            {products.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#6E2C1B]">
                Belum ada data produk. Tambahkan produk pertama di menu Produk &amp; Stok.
              </div>
            ) : (
              products.map((p) => {
                const isLow = p.is_active && p.quantity_on_hand <= 10;
                const isEmpty = p.is_active && p.quantity_on_hand === 0;
                return (
                  <div
                    key={p.id}
                    className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-[#FCF6E0]/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#3E1004] truncate">{p.name}</p>
                      <p className="text-xs text-[#6E2C1B]">
                        {p.category_name} · {p.is_active ? 'Aktif' : 'Nonaktif'}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`font-mono tabular-nums text-sm font-black inline-flex items-center gap-1 ${
                          !p.is_active
                            ? 'text-[#6E2C1B]'
                            : isEmpty
                            ? 'text-[#DC2626]'
                            : isLow
                            ? 'text-[#D97706]'
                            : 'text-[#16A34A]'
                        }`}
                      >
                        {isLow && <AlertTriangle className="w-3.5 h-3.5" />}
                        <span>{p.quantity_on_hand} stok</span>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right: Recent Transactions */}
        <section className="lg:col-span-7 bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EAD29C] flex items-center justify-between">
            <h2 className="font-heading font-black text-base text-[#C7320B]">
              Transaksi Tersimpan Terbaru
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('transactions')}
              className="text-xs font-bold text-[#C7320B] hover:underline cursor-pointer"
            >
              Lihat Semua
            </button>
          </div>

          {recentTx.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-sm font-bold text-[#C7320B]">Belum Ada Transaksi Tersimpan</p>
              <p className="text-xs text-[#6E2C1B] max-w-sm mx-auto">
                Semua ringkasan dan laporan dihitung otomatis dari transaksi nyata. Mulai catat penjualan di Kasir POS.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('pos')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#C7320B] hover:bg-[#A12606] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Mulai Transaksi POS</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5E7B8]/50 border-b border-[#EAD29C] text-[#6E2C1B] font-bold">
                  <tr>
                    <th className="py-2.5 px-4">No. Transaksi</th>
                    <th className="py-2.5 px-4">Waktu</th>
                    <th className="py-2.5 px-4">Metode</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAD29C]/60">
                  {recentTx.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#FCF6E0]/60 transition-colors">
                      <td className="py-2.5 px-4 font-mono tabular-nums font-bold text-[#C7320B]">
                        {tx.transaction_number}
                      </td>
                      <td className="py-2.5 px-4 font-mono tabular-nums text-[#6E2C1B]">
                        {new Date(tx.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-4 uppercase font-semibold text-[#3E1004]">
                        {tx.payment_method}
                      </td>
                      <td className="py-2.5 px-4 font-semibold">
                        <span
                          className={
                            tx.status === 'completed'
                              ? 'text-[#16A34A]'
                              : tx.status === 'refunded'
                              ? 'text-[#D97706]'
                              : 'text-[#DC2626]'
                          }
                        >
                          {tx.status === 'completed'
                            ? 'Selesai'
                            : tx.status === 'refunded'
                            ? 'Refund'
                            : 'Batal'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold text-[#3E1004]">
                        {formatRupiah(tx.grand_total)}
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
