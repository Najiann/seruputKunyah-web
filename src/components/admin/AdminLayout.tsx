import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  ReceiptText,
  BarChart3,
  LogOut,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';
import { Logo } from '../Logo';

export type AdminTab = 'dashboard' | 'pos' | 'products' | 'transactions' | 'reports';

interface AdminLayoutProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onBackToStore: () => void;
  children: React.ReactNode;
}

const TAB_LABELS: Record<AdminTab, string> = {
  dashboard: 'Dashboard',
  pos: 'Point of Sale (POS)',
  products: 'Produk & Inventori',
  transactions: 'Riwayat Transaksi',
  reports: 'Laporan Penjualan',
};

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onSelectTab,
  onBackToStore,
  children,
}) => {
  const { profile, logout, isSupabaseMode } = useAdminAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isAdmin = profile?.role === 'admin';

  const navItems: Array<{
    id: AdminTab;
    label: string;
    icon: React.ReactNode;
    adminOnly?: boolean;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'pos', label: 'Kasir POS', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'products', label: 'Produk & Stok', icon: <Package className="w-4 h-4" /> },
    { id: 'transactions', label: 'Riwayat Transaksi', icon: <ReceiptText className="w-4 h-4" /> },
    { id: 'reports', label: 'Laporan Penjualan', icon: <BarChart3 className="w-4 h-4" />, adminOnly: true },
  ];

  const visibleNav = navItems.filter((item) => !item.adminOnly || isAdmin);

  const handleNavClick = (tab: AdminTab) => {
    onSelectTab(tab);
    setMobileNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FCF6E0] text-[#3E1004] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-[#FFFDF5] border-r border-[#EAD29C] justify-between">
        <div>
          <div className="px-5 py-5 border-b border-[#EAD29C]">
            <Logo size="sm" variant="horizontal" />
          </div>

          <nav className="p-3 space-y-1" aria-label="Navigasi Admin">
            {visibleNav.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#C7320B] text-white'
                      : 'text-[#6E2C1B] hover:bg-[#F5E7B8]/70 hover:text-[#C7320B]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[#EAD29C] space-y-3">
          <div className="text-xs text-[#6E2C1B] space-y-0.5">
            <p className="font-bold text-[#C7320B] truncate">{profile?.display_name}</p>
            <p>
              {profile?.role === 'admin' ? 'Admin' : 'Kasir'} ·{' '}
              {isSupabaseMode ? 'Supabase Live' : 'Mode Lokal'}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={onBackToStore}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-[#C7320B] bg-[#F5E7B8]/70 hover:bg-[#F5E7B8] border border-[#EAD29C] rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Website Publik</span>
            </button>

            <button
              type="button"
              onClick={() => void logout()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-[#DC2626] hover:bg-[#DC2626]/10 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 bg-[#3E1004]/40 backdrop-blur-xs"
          />
          <aside className="relative w-72 max-w-[82vw] h-full bg-[#FFFDF5] border-r border-[#EAD29C] flex flex-col justify-between p-4">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#EAD29C]">
                <Logo size="sm" variant="horizontal" />
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1.5 text-[#6E2C1B] hover:text-[#C7320B] rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="mt-4 space-y-1">
                {visibleNav.map((item) => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap cursor-pointer ${
                        active
                          ? 'bg-[#C7320B] text-white'
                          : 'text-[#6E2C1B] hover:bg-[#F5E7B8]/70 hover:text-[#C7320B]'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#EAD29C] space-y-2">
              <p className="text-xs text-[#6E2C1B]">
                <strong className="text-[#C7320B]">{profile?.display_name}</strong> ·{' '}
                {profile?.role === 'admin' ? 'Admin' : 'Kasir'}
              </p>
              <button
                type="button"
                onClick={onBackToStore}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-[#C7320B] bg-[#F5E7B8]/70 border border-[#EAD29C] rounded-xl cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Website Publik</span>
              </button>
              <button
                type="button"
                onClick={() => void logout()}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-[#DC2626] hover:bg-[#DC2626]/10 rounded-xl cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Contract: Breadcrumb on left, 1-2 actions on right */}
        <header className="h-16 bg-[#FFFDF5] border-b border-[#EAD29C] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 text-[#C7320B] hover:bg-[#F5E7B8] rounded-xl cursor-pointer"
              aria-label="Buka menu admin"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm truncate">
              <span className="text-[#6E2C1B] font-medium">Admin</span>
              <span className="text-[#EAD29C]" aria-hidden="true">/</span>
              <span className="font-heading font-black text-[#C7320B] truncate">
                {TAB_LABELS[activeTab]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-xs text-[#6E2C1B] whitespace-nowrap">
              {profile?.display_name} · {profile?.role === 'admin' ? 'Admin' : 'Kasir'}
            </span>
            {activeTab !== 'pos' && (
              <button
                type="button"
                onClick={() => onSelectTab('pos')}
                className="px-4 py-2 bg-[#C7320B] hover:bg-[#A12606] text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Buka POS
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
