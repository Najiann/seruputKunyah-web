import React, { useEffect, useRef, useState } from 'react';
import { X, Upload, Link2, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { AdminProduct, Profile } from '../../types';
import { updateProductPhoto, uploadProductPhoto } from '../../services/adminBackendService';

interface ProductPhotoModalProps {
  product: AdminProduct | null;
  actor: Profile | null;
  onClose: () => void;
  onSaved: (message: string) => Promise<void> | void;
}

const PRESET_PRODUCT_IMAGES = [
  { label: 'Makaroni Basah', url: '/images/makaroni-basah.jpg' },
  { label: 'Makaroni Kering', url: '/images/makaroni-kering.jpg' },
  { label: 'Es Teh Manis', url: '/images/es-teh.jpg' },
  { label: 'Es Teh Lemon', url: '/images/es-teh-lemon.jpg' },
  { label: 'Hero Standar', url: '/images/hero.jpg' },
];

export const ProductPhotoModal: React.FC<ProductPhotoModalProps> = ({
  product,
  actor,
  onClose,
  onSaved,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [previewFailed, setPreviewFailed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoNote, setInfoNote] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setImageUrl(product.image_url || '');
      setPreviewFailed(false);
      setErrorMsg(null);
      setInfoNote(null);
    }
  }, [product]);

  if (!product) return null;

  const handleFileSelected = async (file: File | undefined) => {
    if (!file || !actor) return;
    setErrorMsg(null);
    setInfoNote(null);
    setIsUploading(true);
    try {
      const result = await uploadProductPhoto(file, product.id, actor);
      setImageUrl(result.url);
      setPreviewFailed(false);
      if (result.uploadedToStorage) {
        setInfoNote('Foto berhasil diunggah ke Supabase Storage. Klik "Simpan Foto" untuk menerapkan ke katalog.');
      } else if (result.storageNote) {
        setInfoNote(result.storageNote);
      } else {
        setInfoNote('Foto siap disimpan. Klik "Simpan Foto" untuk menerapkan ke katalog.');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal memproses file foto.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    setErrorMsg(null);
    setIsSaving(true);
    try {
      await updateProductPhoto(product.id, imageUrl, actor);
      await onSaved(`Foto produk "${product.name}" berhasil diperbarui.`);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal menyimpan foto produk.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#3E1004]/55 backdrop-blur-xs"
      />
      <div className="min-h-full flex items-center justify-center p-4">
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="relative bg-[#FFFDF5] border border-[#EAD29C] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-[#EAD29C]">
            <div>
              <h2 className="font-heading text-lg font-black text-[#C7320B]">
                Ganti Foto Produk
              </h2>
              <p className="text-xs text-[#6E2C1B] mt-0.5">
                {product.name} · {product.category_name}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-[#6E2C1B] hover:text-[#C7320B] cursor-pointer"
              aria-label="Tutup modal foto"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 4:3 Live Preview matching storefront ProductCard */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-[#6E2C1B]">
              Pratinjau Katalog (Rasio 4:3)
            </span>
            <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-[#F5E7B8] border border-[#EAD29C] flex items-center justify-center">
              {imageUrl && !previewFailed ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={() => setPreviewFailed(true)}
                />
              ) : (
                <div className="text-center p-4 text-[#6E2C1B] space-y-1.5">
                  <ImageIcon className="w-8 h-8 mx-auto text-[#C7320B]/50" />
                  <p className="text-xs font-bold text-[#C7320B]">Belum ada pratinjau foto</p>
                  <p className="text-[11px]">Unggah gambar atau masukkan URL foto yang valid.</p>
                </div>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/30 text-xs font-semibold text-[#DC2626] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoNote && (
            <div className="p-3 rounded-xl bg-[#16A34A]/10 border border-[#16A34A]/30 text-xs font-semibold text-[#16A34A]">
              {infoNote}
            </div>
          )}

          {/* Upload File from Device */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-[#6E2C1B]">
              Unggah Foto Baru (JPG, PNG, WebP · Maks 5 MB)
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => void handleFileSelected(e.target.files?.[0])}
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 bg-[#FCF6E0] hover:bg-[#F5E7B8] border border-dashed border-[#C7320B]/50 rounded-xl text-xs font-bold text-[#C7320B] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>
                {isUploading
                  ? 'Mengompresi & Mengunggah Foto...'
                  : 'Pilih Foto dari HP / Laptop'}
              </span>
            </button>
          </div>

          {/* Direct URL Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="photo-modal-url"
              className="block text-xs font-bold text-[#6E2C1B]"
            >
              Atau Tempel URL Foto Langsung
            </label>
            <div className="relative">
              <Link2 className="w-4 h-4 text-[#6E2C1B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="photo-modal-url"
                type="text"
                value={imageUrl.startsWith('data:image/') ? '' : imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setPreviewFailed(false);
                }}
                placeholder={
                  imageUrl.startsWith('data:image/')
                    ? 'Foto dari perangkat siap disimpan (tempel URL jika ingin ganti)'
                    : 'https://... atau /images/makaroni-basah.jpg'
                }
                className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-white border border-[#EAD29C] rounded-xl text-[#3E1004] focus:outline-none focus:ring-2 focus:ring-[#FF8234]"
              />
            </div>
          </div>

          {/* Built-in Presets */}
          <div className="space-y-1.5">
            <span className="block text-xs font-bold text-[#6E2C1B]">
              Foto Bawaan Proyek
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PRODUCT_IMAGES.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => {
                    setImageUrl(preset.url);
                    setPreviewFailed(false);
                    setInfoNote(null);
                  }}
                  className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    imageUrl === preset.url
                      ? 'bg-[#C7320B] text-white'
                      : 'bg-[#F5E7B8]/70 hover:bg-[#F5E7B8] text-[#C7320B]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EAD29C]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#6E2C1B] hover:bg-[#F5E7B8]/60 rounded-xl cursor-pointer whitespace-nowrap"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading || !imageUrl.trim()}
              className="px-5 py-2 bg-[#C7320B] hover:bg-[#A12606] disabled:opacity-50 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Foto'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
