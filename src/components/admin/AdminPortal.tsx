import React, { useCallback, useEffect, useState } from 'react';
import { AdminAuthProvider, useAdminAuth } from './AdminAuthContext';
import { AdminLoginView } from './AdminLoginView';
import { AdminLayout, AdminTab } from './AdminLayout';
import { AdminDashboardView } from './AdminDashboardView';
import { AdminPosView } from './AdminPosView';
import { AdminProductsView } from './AdminProductsView';
import { AdminTransactionsView } from './AdminTransactionsView';
import { AdminReportsView } from './AdminReportsView';
import { AdminReviewsView } from './AdminReviewsView';
import {
  listAdminProducts,
  listCategories,
  listStockMovements,
  listTransactions,
} from '../../services/adminBackendService';
import { listAdminReviews } from '../../services/reviewService';
import {
  AdminProduct,
  Category,
  CustomerReview,
  StockMovement,
  TransactionRecord,
} from '../../types';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface AdminPortalProps {
  onBackToStore: () => void;
}

const AdminPortalShell: React.FC<AdminPortalProps> = ({ onBackToStore }) => {
  const { profile, loading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [reviewsTableMissing, setReviewsTableMissing] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshAll = useCallback(async () => {
    if (!profile) return;
    setLoadingData(true);
    setLoadError(null);
    try {
      const [cats, prods, movs, txs, revRes] = await Promise.all([
        listCategories(),
        listAdminProducts(),
        listStockMovements(),
        listTransactions(),
        listAdminReviews(),
      ]);
      setCategories(cats);
      setProducts(prods);
      setMovements(movs);
      setTransactions(txs);
      setReviews(revRes.reviews);
      setReviewsTableMissing(revRes.tableMissing);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Gagal memuat data admin.');
    } finally {
      setLoadingData(false);
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      void refreshAll();
    }
  }, [profile, refreshAll]);

  // Enforce role restriction even if tab state was set
  const handleSelectTab = (tab: AdminTab) => {
    if (tab === 'reports' && profile?.role !== 'admin') {
      return;
    }
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCF6E0] flex items-center justify-center p-6">
        <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl px-6 py-4 text-sm font-bold text-[#C7320B]">
          Memeriksa sesi autentikasi...
        </div>
      </div>
    );
  }

  if (!profile) {
    return <AdminLoginView onBackToStore={onBackToStore} />;
  }

  return (
    <AdminLayout
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      onBackToStore={onBackToStore}
    >
      {loadError && (
        <div className="mb-6 p-4 bg-[#DC2626]/10 border border-[#DC2626]/30 rounded-2xl flex items-center justify-between gap-3 text-xs font-semibold text-[#DC2626]">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {loadError}
          </span>
          <button
            type="button"
            onClick={() => void refreshAll()}
            className="px-3 py-1.5 bg-white border border-[#DC2626]/30 rounded-lg inline-flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {activeTab === 'dashboard' && (
        <AdminDashboardView
          products={products}
          transactions={transactions}
          loading={loadingData}
          onRefresh={() => void refreshAll()}
          onNavigate={handleSelectTab}
        />
      )}

      {activeTab === 'pos' && (
        <AdminPosView
          products={products}
          categories={categories}
          onCheckoutSuccess={refreshAll}
        />
      )}

      {activeTab === 'products' && (
        <AdminProductsView
          products={products}
          categories={categories}
          movements={movements}
          loading={loadingData}
          onRefresh={refreshAll}
        />
      )}

      {activeTab === 'transactions' && (
        <AdminTransactionsView
          transactions={transactions}
          loading={loadingData}
          onRefresh={refreshAll}
        />
      )}

      {activeTab === 'reviews' && (
        <AdminReviewsView
          reviews={reviews}
          tableMissing={reviewsTableMissing}
          loading={loadingData}
          onRefresh={refreshAll}
        />
      )}

      {activeTab === 'reports' && (
        <AdminReportsView transactions={transactions} loading={loadingData} />
      )}
    </AdminLayout>
  );
};

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToStore }) => {
  return (
    <AdminAuthProvider>
      <AdminPortalShell onBackToStore={onBackToStore} />
    </AdminAuthProvider>
  );
};
