import React, { useState } from 'react';
import { Lock, Mail, User, ArrowLeft, AlertCircle, ShieldCheck, Database } from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';
import { UserRole } from '../../types';
import { Logo } from '../Logo';

interface AdminLoginViewProps {
  onBackToStore: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({ onBackToStore }) => {
  const { isSupabaseMode, loginWithSupabase, loginLocalSandbox } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localName, setLocalName] = useState('Admin Utama');
  const [localRole, setLocalRole] = useState<UserRole>('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await loginWithSupabase(email, password);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal masuk ke sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!localName.trim()) {
      setErrorMsg('Nama petugas wajib diisi.');
      return;
    }
    loginLocalSandbox(localName, localRole);
  };

  return (
    <div className="min-h-screen bg-[#FCF6E0] text-[#3E1004] flex flex-col justify-between px-4 py-8">
      <div className="max-w-md w-full mx-auto">
        <button
          type="button"
          onClick={onBackToStore}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#C7320B] hover:text-[#A12606] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Website Toko</span>
        </button>

        <div className="bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-3 border-b border-[#EAD29C] pb-5">
            <Logo size="md" variant="horizontal" />
            <div>
              <h1 className="font-heading text-2xl font-black text-[#C7320B] tracking-tight">
                Portal Admin &amp; Kasir POS
              </h1>
              <p className="text-xs text-[#6E2C1B] mt-1 leading-relaxed">
                Masuk menggunakan akun berwenang untuk mengakses dashboard, produk, inventori, kasir POS, dan laporan penjualan.
              </p>
            </div>
          </div>

          {!isSupabaseMode && (
            <div className="p-3.5 rounded-xl bg-[#F5E7B8]/60 border border-[#EAD29C] text-xs text-[#6E2C1B] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#C7320B]">
                <Database className="w-4 h-4 shrink-0" />
                <span>Mode Penyimpanan Lokal (Supabase Belum Dihubungkan)</span>
              </div>
              <p className="leading-relaxed">
                Isi <code className="font-mono text-[11px] bg-white px-1 py-0.5 rounded border border-[#EAD29C]">VITE_SUPABASE_URL</code> dan{' '}
                <code className="font-mono text-[11px] bg-white px-1 py-0.5 rounded border border-[#EAD29C]">VITE_SUPABASE_ANON_KEY</code> di environment untuk mengaktifkan Supabase Auth &amp; PostgreSQL secara live.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 text-xs font-semibold text-[#DC2626] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSupabaseMode ? (
            <form onSubmit={handleSupabaseLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="block text-xs font-bold text-[#C7320B] mb-1.5">
                  Email Petugas
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6E2C1B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@seruputkunyah.id"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[#EAD29C] rounded-xl text-[#3E1004] focus:outline-none focus:ring-2 focus:ring-[#FF8234]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-xs font-bold text-[#C7320B] mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#6E2C1B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="admin-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[#EAD29C] rounded-xl text-[#3E1004] focus:outline-none focus:ring-2 focus:ring-[#FF8234]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-[#C7320B] hover:bg-[#A12606] disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? 'Memeriksa Sesi...' : 'Masuk ke Dashboard'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleLocalLogin} className="space-y-4">
              <div>
                <label htmlFor="sandbox-name" className="block text-xs font-bold text-[#C7320B] mb-1.5">
                  Nama Petugas (Profil Sesi)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#6E2C1B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="sandbox-name"
                    type="text"
                    required
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    placeholder="Contoh: Jihan (Owner)"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-[#EAD29C] rounded-xl text-[#3E1004] focus:outline-none focus:ring-2 focus:ring-[#FF8234]"
                  />
                </div>
              </div>

              <div>
                <span className="block text-xs font-bold text-[#C7320B] mb-1.5">
                  Pilih Role Operasional (<code className="font-mono text-[11px]">profiles.role</code>)
                </span>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#F5E7B8]/70 rounded-xl border border-[#EAD29C]">
                  <button
                    type="button"
                    onClick={() => {
                      setLocalRole('admin');
                      if (localName === 'Kasir Booth') setLocalName('Admin Utama');
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      localRole === 'admin'
                        ? 'bg-[#C7320B] text-white shadow-xs'
                        : 'text-[#6E2C1B] hover:text-[#C7320B]'
                    }`}
                  >
                    Admin (Akses Penuh)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLocalRole('cashier');
                      if (localName === 'Admin Utama') setLocalName('Kasir Booth');
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      localRole === 'cashier'
                        ? 'bg-[#C7320B] text-white shadow-xs'
                        : 'text-[#6E2C1B] hover:text-[#C7320B]'
                    }`}
                  >
                    Kasir (Operasi POS)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#C7320B] hover:bg-[#A12606] text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Buka Panel {localRole === 'admin' ? 'Admin' : 'Kasir POS'}</span>
              </button>
            </form>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-[#6E2C1B] mt-6">
        SERUPUT &amp; KUNYAH · Sistem Operasional &amp; POS
      </p>
    </div>
  );
};
