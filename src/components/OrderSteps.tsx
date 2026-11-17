import React from 'react';
import { ShoppingBag, CheckCircle, Send, CheckSquare } from 'lucide-react';

export const OrderSteps: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Pilih Menu',
      description: 'Pilih camilan makaroni favoritmu (basah/kering) dan minuman es teh pelepas dahaga.',
      icon: <CheckSquare className="w-5 h-5 text-[#C7320B]" />,
    },
    {
      step: '02',
      title: 'Masuk Keranjang',
      description: 'Tentukan jumlah porsi dan varian rasa atau tingkat manis sesuai seleramu.',
      icon: <ShoppingBag className="w-5 h-5 text-[#C7320B]" />,
    },
    {
      step: '03',
      title: 'Cek Total Sementara',
      description: 'Buka keranjang untuk meninjau rincian pesanan dan mengisi catatan tambahan jika ada.',
      icon: <CheckCircle className="w-5 h-5 text-[#C7320B]" />,
    },
    {
      step: '04',
      title: 'Kirim via WhatsApp',
      description: 'Klik checkout untuk meneruskan ringkasan pesanan ke WhatsApp admin guna konfirmasi.',
      icon: <Send className="w-5 h-5 text-[#C7320B]" />,
    },
  ];

  return (
    <section id="cara-pesan" className="py-16 sm:py-20 bg-[#F5E7B8]/40 border-y border-[#EAD29C]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <p className="text-xs font-bold text-[#C7320B] uppercase tracking-wider">
            Alur Praktis Tanpa Ribet
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#C7320B] tracking-tight">
            Pesan Favoritmu dengan Mudah
          </h2>
          <p className="text-sm text-[#6E2C1B]">
            Proses pemesanan cepat dan langsung terhubung dengan tim SERUPUT &amp; KUNYAH.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(item => (
            <div
              key={item.step}
              className="bg-[#FFFDF5] rounded-2xl p-6 border border-[#EAD29C] shadow-2xs flex flex-col justify-between hover:border-[#FF8234] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F5E7B8] flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="font-heading text-2xl font-black text-[#FF8234]">
                    {item.step}
                  </span>
                </div>

                <h3 className="font-heading font-black text-lg text-[#C7320B] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-[#6E2C1B] leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#EAD29C]/60 flex items-center gap-1.5 text-[11px] font-bold text-[#C7320B]">
                <span>Langkah {item.step}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Informational Callout */}
        <div className="mt-10 max-w-2xl mx-auto p-4 rounded-xl bg-[#FFFDF5] border border-[#EAD29C] text-center text-xs text-[#6E2C1B]">
          <p>
            <strong>Catatan:</strong> Ketersediaan stok bahan harian, kesepakatan titik antar (COD area kampus), serta metode pembayaran (QRIS/Tunai) akan dikonfirmasi oleh admin melalui chat WhatsApp.
          </p>
        </div>

      </div>
    </section>
  );
};
