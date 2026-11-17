import React, { useEffect, useState } from 'react';
import { X, Camera, ShieldCheck, ExternalLink, AlertCircle } from 'lucide-react';
import { AdminProduct, Profile } from '../types';
import {
  getCurrentProfile,
  listAdminProducts,
} from '../services/adminBackendService';
import { ensureSupabaseClient } from '../lib/supabase';
import { ProductPhotoModal } from './admin/ProductPhotoModal';

interface QuickPhotoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminPortal?: () => void;
}

export const QuickPhotoManagerModal: React.FC<QuickPhotoManagerModalProps> = ({
  isOpen,
  onClose,
  onOpenAdminPortal,
}) => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSupabaseMode, setIsSupabaseMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const client = await ensureSupabaseClient();
      const supaLive = Boolean(client);
      setIsSupabaseMode(supaLive);

      const currentProf = await getCurrentProfile();
      setProfile(currentProf);

      const list = await listAdminProducts();
      setProducts(list);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal memuat daftar produk.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSuccessMsg(null);
      void loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const canEditPhotos =
    (isSupabaseMode && profile?.role === 'admin') || !isSupabaseMode;

  // For local sandbox mode without explicit login, synthesize local admin actor
  const effectiveActor: Profile | null =
    profile ||
    (!isSupabaseMode
      ? {
          id: 'local-admin-quick',
          display_name: 'Admin Toko',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      : null);

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#3E1004]/55 backdrop-blur-xs"
        />

        <div className="min-h-full flex items-center justify-center p-4">
          <div className="relative bg-[#FCF6E0] border-2 border-[#EAD29C] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-[#EAD29C]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#C7320B] text-white rounded-xl">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-black text-[#C7320B]">
                    Kelola Foto Produk
                  </h3>
                  <p className="text-xs text-[#6E2C1B]">
                    Pilih produk untuk mengganti foto dari galeri HP/Laptop atau URL.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-[#6E2C1B] hover:text-[#C7320B] rounded-full hover:bg-[#F5E7B8] cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSupabaseMode && profile?.role !== 'admin' && (
              <div className="p-4 rounded-2xl bg-[#FFFDF5] border border-[#EAD29C] space-y-2.5 text-xs">
                <div className="flex items-center gap-2 font-black text-[#C7320B]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Login Admin Diperlukan (Proteksi Database Supabase)</span>
                </div>
                <p className="text-[#6E2C1B] leading-relaxed">
                  Database Supabase kamu aktif dan terlindungi RLS — hanya akun ber-role{' '}
                  <strong>admin</strong> yang boleh mengubah foto produk. Masuk dulu di{' '}
                  <strong>/admin</strong> lalu ubah foto langsung dari sini atau dari menu{' '}
                  <strong>Produk &amp; Stok</strong>.
                </p>
                {onOpenAdminPortal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAdminPortal();
                    }}
                    className="px-4 py-2 bg-[#C7320B] hover:bg-[#A12606] text-white font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Login di Dashboard Admin</span>
                  </button>
                )}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 text-xs font-semibold text-[#DC2626] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/30 text-xs font-semibold text-[#16A34A]">
                {successMsg}
              </div>
            )}

            <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
              {loading ? (
                <div className="py-8 text-center text-xs text-[#6E2C1B]">
                  Memuat daftar produk...
                </div>
              ) : products.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#6E2C1B]">
                  Belum ada produk ditemukan.
                </div>
              ) : (
                products.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-12 rounded-xl bg-[#F5E7B8] border border-[#EAD29C] overflow-hidden shrink-0 flex items-center justify-center">
                        {prod.image_url ? (
                          <img
                            src={prod.image_url}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="font-heading font-black text-sm text-[#C7320B]">
                            {prod.name.slice(0, 1)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading font-black text-sm text-[#C7320B] truncate">
                          {prod.name}
                        </p>
                        <p className="text-[11px] text-[#6E2C1B]">
                          {prod.category_name} · {prod.is_active ? 'Aktif' : 'Nonaktif'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!canEditPhotos}
                      onClick={() => setSelectedProduct(prod)}
                      className="px-3.5 py-2 bg-[#C7320B] hover:bg-[#A12606] disabled:opacity-40 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Ganti Foto</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <ProductPhotoModal
        product={selectedProduct}
        actor={effectiveActor}
        onClose={() => setSelectedProduct(null)}
        onSaved={async (msg) => {
          setSuccessMsg(msg);
          await loadData();
        }}
      />
    </>
  );
};
