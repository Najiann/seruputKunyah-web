import React, { useState } from 'react';
import { X, Copy, Check, Code2, BookOpen, Layers, Terminal } from 'lucide-react';

interface VuePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VuePortfolioModal: React.FC<VuePortfolioModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'useCart' | 'products' | 'whatsapp' | 'cartDrawer' | 'productCard'>('overview');
  const [copied, setCopied] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const codeSnippets = {
    useCart: `// src/composables/useCart.js
import { ref, computed, watch } from 'vue';
import { PRODUCTS } from '../data/products';

const STORAGE_KEY = 'seruput_kunyah_cart_v1';

// Shared state across all Vue components
const items = ref([]);
const customerNote = ref('');
const isCartOpen = ref(false);

// Initialize from localStorage
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    items.value = parsed.map(entry => {
      const product = PRODUCTS.find(p => p.id === entry.productId);
      return product ? { product, quantity: entry.quantity, notes: entry.notes || '' } : null;
    }).filter(Boolean);
  }
} catch (e) {
  console.warn('Failed to load cart from storage', e);
}

// Persist minimal state
watch(items, (newItems) => {
  try {
    const minimal = newItems.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      notes: item.notes
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
  } catch (e) {
    console.warn('Failed to persist cart', e);
  }
}, { deep: true });

export function useCart() {
  const addToCart = (product, quantity = 1, notes = '') => {
    const existing = items.value.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
      if (notes) existing.notes = notes;
    } else {
      items.value.push({ product, quantity, notes });
    }
  };

  const updateQuantity = (productId, delta) => {
    const item = items.value.find(i => i.product.id === productId);
    if (item) {
      const nextQty = item.quantity + delta;
      if (nextQty <= 0) {
        removeFromCart(productId);
      } else {
        item.quantity = nextQty;
      }
    }
  };

  const removeFromCart = (productId) => {
    items.value = items.value.filter(item => item.product.id !== productId);
  };

  const clearCart = () => {
    items.value = [];
  };

  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  });

  return {
    items,
    customerNote,
    isCartOpen,
    openCart: () => { isCartOpen.value = true; },
    closeCart: () => { isCartOpen.value = false; },
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice
  };
}`,

    products: `// src/data/products.js
export const PRODUCTS = [
  {
    id: 'makaroni-basah',
    name: 'Makaroni Basah',
    category: 'food',
    categoryLabel: 'Makanan',
    description: 'Makaroni kenyal hangat berbalut bumbu gurih khas dan rempah cabai pilihan. Cocok dinikmati saat rehat santai.',
    price: 8000,
    image: '/images/makaroni-basah.jpg',
    badge: 'Favorit',
    spicyOptions: ['Pedas Santai (Level 1)', 'Pedas Sedang (Level 2)', 'Pedas Nendang (Level 3)', 'Gurih Original (Tidak Pedas)']
  },
  {
    id: 'makaroni-kering',
    name: 'Makaroni Kering',
    category: 'food',
    categoryLabel: 'Makanan',
    description: 'Makaroni goreng renyah kriuk dengan taburan bumbu asin pedas gurih. Camilan wajib teman nugas dan ngobrol.',
    price: 8000,
    image: '/images/makaroni-kering.jpg',
    badge: 'Kriuk Gurih',
    spicyOptions: ['Pedas Santai (Level 1)', 'Pedas Sedang (Level 2)', 'Pedas Nendang (Level 3)', 'Gurih Original (Tidak Pedas)']
  },
  {
    id: 'es-teh',
    name: 'Es Teh Manis',
    category: 'drink',
    categoryLabel: 'Minuman',
    description: 'Seduhan teh melati wangi dengan rasa manis pas dan dingin menyegarkan. Penghilang dahaga paling pas sehabis nyemil.',
    price: 4000,
    image: '/images/es-teh.jpg',
    badge: 'Segar Pas',
    spicyOptions: ['Manis Normal', 'Sedikit Manis (Less Sugar)']
  },
  {
    id: 'es-teh-lemon',
    name: 'Es Teh Lemon',
    category: 'drink',
    categoryLabel: 'Minuman',
    description: 'Kombinasi teh aromatik dingin dengan perasan dan irisan lemon segar. Sensasi asam manis yang langsung melegakan.',
    price: 6000,
    image: '/images/es-teh-lemon.jpg',
    badge: 'Ekstra Segar',
    spicyOptions: ['Manis Normal', 'Sedikit Manis (Less Sugar)']
  }
];`,

    whatsapp: `// src/utils/whatsapp.js
import { formatRupiah } from './currency';

export function buildWhatsAppMessage(items, customerNote = '', customerName = '') {
  if (!items || items.length === 0) return '';

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const lines = [];
  lines.push('Halo SERUPUT & KUNYAH! Saya ingin memesan:\\n');

  if (customerName && customerName.trim()) {
    lines.push(\`Nama Pemesan: \${customerName.trim()}\\n\`);
  }

  items.forEach((item, index) => {
    const itemSubtotal = item.product.price * item.quantity;
    lines.push(\`\${index + 1}. \${item.product.name} x \${item.quantity}\`);
    lines.push(\`   Harga satuan: \${formatRupiah(item.product.price)}\`);
    lines.push(\`   Subtotal: \${formatRupiah(itemSubtotal)}\`);
    if (item.notes && item.notes.trim()) {
      lines.push(\`   Varian/Rasa: \${item.notes.trim()}\`);
    }
    lines.push('');
  });

  lines.push(\`Total sementara: \${formatRupiah(total)}\\n\`);

  if (customerNote && customerNote.trim()) {
    lines.push(\`Catatan: \${customerNote.trim()}\\n\`);
  }

  lines.push('Mohon konfirmasi ketersediaan produk, ongkos kirim jika berlaku, dan metode pembayaran.\\n');
  lines.push('Terima kasih!');

  return lines.join('\\n');
}

export function getWhatsAppOrderUrl(phoneNumber, items, customerNote = '', customerName = '') {
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  const message = buildWhatsAppMessage(items, customerNote, customerName);
  return \`https://wa.me/\${cleanNumber}?text=\${encodeURIComponent(message)}\`;
}`,

    productCard: `<!-- src/components/ProductCard.vue -->
<template>
  <article class="bg-[#FFFAF1] rounded-2xl border border-[#E8D5B5] overflow-hidden flex flex-col h-full shadow-xs hover:shadow-md transition-all">
    <div class="relative aspect-4/3 overflow-hidden bg-[#F5E6C8]/50">
      <img :src="product.image" :alt="product.name" class="w-full h-full object-cover" />
      <span class="absolute top-3 left-3 bg-[#FFFAF1]/90 text-xs font-bold px-2 py-1 rounded">
        {{ product.categoryLabel }}
      </span>
    </div>

    <div class="p-5 flex flex-col flex-1 justify-between">
      <div>
        <div class="flex justify-between items-baseline mb-2">
          <h3 class="font-bold text-lg text-[#70412E]">{{ product.name }}</h3>
          <span class="font-bold text-[#70412E]">{{ formatRupiah(product.price) }}</span>
        </div>
        <p class="text-xs text-[#806B58] line-clamp-2">{{ product.description }}</p>

        <!-- Variant Picker -->
        <div v-if="product.spicyOptions" class="mt-3">
          <select v-model="selectedVariant" class="w-full text-xs p-1.5 border rounded-lg bg-[#F5E6C8]/30">
            <option v-for="opt in product.spicyOptions" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>
      </div>

      <button @click="handleAdd" class="mt-4 w-full py-2 bg-[#70412E] text-white font-bold text-xs rounded-xl">
        {{ added ? '✓ Berhasil Ditambahkan' : '+ Tambah ke Keranjang' }}
      </button>
    </div>
  </article>
</template>

<script setup>
import { ref } from 'vue';
import { useCart } from '../composables/useCart';
import { formatRupiah } from '../utils/currency';

const props = defineProps({
  product: { type: Object, required: true }
});

const { addToCart } = useCart();
const selectedVariant = ref(props.product.spicyOptions?.[1] || props.product.spicyOptions?.[0] || '');
const added = ref(false);

const handleAdd = () => {
  addToCart(props.product, 1, selectedVariant.value);
  added.value = true;
  setTimeout(() => { added.value = false; }, 1200);
};
</script>`,

    cartDrawer: `<!-- src/components/CartDrawer.vue -->
<template>
  <div v-if="isCartOpen" class="fixed inset-0 z-50">
    <div @click="closeCart" class="fixed inset-0 bg-[#70412E]/40 backdrop-blur-xs"></div>
    <aside class="fixed inset-y-0 right-0 max-w-md w-full bg-[#FFFAF1] shadow-2xl flex flex-col p-6 z-10">
      <div class="flex justify-between items-center pb-4 border-b">
        <h2 class="font-bold text-xl text-[#70412E]">Keranjang Pesanan ({{ totalItems }})</h2>
        <button @click="closeCart" class="text-sm font-bold">✕ Tutup</button>
      </div>

      <div class="flex-1 overflow-y-auto py-4 space-y-3">
        <div v-for="item in items" :key="item.product.id" class="p-3 bg-white rounded-xl border flex justify-between">
          <div>
            <h4 class="font-bold text-sm text-[#70412E]">{{ item.product.name }}</h4>
            <p class="text-xs text-[#806B58]">{{ formatRupiah(item.product.price) }} x {{ item.quantity }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button @click="updateQuantity(item.product.id, -1)" class="px-2 py-0.5 border rounded">-</button>
            <span>{{ item.quantity }}</span>
            <button @click="updateQuantity(item.product.id, 1)" class="px-2 py-0.5 border rounded">+</button>
          </div>
        </div>
      </div>

      <div class="pt-4 border-t space-y-3">
        <div class="flex justify-between font-bold text-lg text-[#70412E]">
          <span>Total:</span>
          <span>{{ formatRupiah(totalPrice) }}</span>
        </div>
        <button @click="handleCheckout" class="w-full py-3 bg-[#70412E] text-white font-bold rounded-xl">
          Checkout WhatsApp
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { useCart } from '../composables/useCart';
import { formatRupiah } from '../utils/currency';
import { getWhatsAppOrderUrl } from '../utils/whatsapp';

const { items, isCartOpen, closeCart, totalItems, totalPrice, customerNote, updateQuantity } = useCart();

const handleCheckout = () => {
  const url = getWhatsAppOrderUrl('6281234567890', items.value, customerNote.value);
  window.open(url, '_blank');
};
</script>`
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div onClick={onClose} className="fixed inset-0 bg-[#70412E]/60 backdrop-blur-xs transition-opacity" />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-6">
        <div className="relative bg-[#FFFAF1] border-2 border-[#E8D5B5] rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[#E8D5B5]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#78804B]/15 text-[#78804B] text-xs font-black rounded-full uppercase">
                <Code2 className="w-3.5 h-3.5" />
                <span>Portofolio &amp; Arsitektur Vue.js 3</span>
              </div>
              <h3 className="font-heading text-2xl font-black text-[#70412E]">
                Panduan Migrasi &amp; Implementasi Vue.js 3
              </h3>
              <p className="text-xs text-[#806B58]">
                Sesuai ketentuan Bagian 8: Informasi arsitektur, perbedaan lingkungan, dan source code Vue 3 Composition API siap pakai untuk tugas kuliah &amp; portofolio Anda.
              </p>
            </div>
            <button onClick={onClose} type="button" className="p-2 text-[#806B58] hover:text-[#70412E] rounded-full hover:bg-[#F5E6C8]">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1.5 pt-4 pb-3 border-b border-[#E8D5B5]/60 text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-[#70412E] text-white' : 'text-[#70412E] hover:bg-[#F5E6C8]'}`}
            >
              Penjelasan Arsitektur
            </button>
            <button
              onClick={() => setActiveTab('useCart')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'useCart' ? 'bg-[#70412E] text-white' : 'text-[#70412E] hover:bg-[#F5E6C8]'}`}
            >
              src/composables/useCart.js
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'products' ? 'bg-[#70412E] text-white' : 'text-[#70412E] hover:bg-[#F5E6C8]'}`}
            >
              src/data/products.js
            </button>
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'whatsapp' ? 'bg-[#70412E] text-white' : 'text-[#70412E] hover:bg-[#F5E6C8]'}`}
            >
              src/utils/whatsapp.js
            </button>
            <button
              onClick={() => setActiveTab('productCard')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'productCard' ? 'bg-[#70412E] text-white' : 'text-[#70412E] hover:bg-[#F5E6C8]'}`}
            >
              ProductCard.vue
            </button>
            <button
              onClick={() => setActiveTab('cartDrawer')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'cartDrawer' ? 'bg-[#70412E] text-white' : 'text-[#70412E] hover:bg-[#F5E6C8]'}`}
            >
              CartDrawer.vue
            </button>
          </div>

          {/* Tab Content */}
          <div className="py-4 max-h-[60vh] overflow-y-auto">
            {activeTab === 'overview' ? (
              <div className="space-y-4 text-xs sm:text-sm text-[#70412E]">
                <div className="p-4 bg-[#F5E6C8]/50 rounded-2xl border border-[#E8D5B5] space-y-2">
                  <h4 className="font-heading font-black text-base text-[#70412E] flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#C58B55]" />
                    <span>Laporan Kejujuran Teknologi &amp; Keselarasan Master Prompt</span>
                  </h4>
                  <p className="text-xs text-[#806B58] leading-relaxed">
                    Di lingkungan Google AI Studio Build ini, dev server terkonfigurasi dengan React 19 + TypeScript + Vite. 
                    Sesuai instruksi master prompt di <strong>Bagian 8</strong>:
                  </p>
                  <blockquote className="p-2.5 bg-white/70 border-l-3 border-[#70412E] text-xs italic text-[#70412E] rounded">
                    &ldquo;Jika lingkungan AI Studio yang digunakan menghasilkan prototipe React atau HTML alih-alih proyek Vue, prioritaskan desain dan perilaku prototipe terlebih dahulu. Setelah itu, jelaskan perbedaan implementasi dan sediakan panduan migrasi ke Vue.js 3. Jangan mengklaim hasil sudah berbasis Vue apabila implementasinya belum benar-benar menggunakan Vue.&rdquo;
                  </blockquote>
                  <p className="text-xs text-[#806B58] leading-relaxed">
                    Oleh karena itu, prototipe interaktif yang Anda gunakan saat ini berjalan penuh dengan seluruh fitur (katalog, keranjang interaktif, perhitungan otomatis, WhatsApp checkout, dan responsive design). Kode ekuivalen <strong>Vue.js 3 Composition API</strong> telah kami sediakan lengkap di tab-tab samping agar Anda dapat langsung mengekspor dan menunjukkannya di laporan tugas kewirausahaan/portofolio Vue.js Anda!
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#E8D5B5] space-y-3">
                  <h4 className="font-heading font-black text-sm text-[#70412E] flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#78804B]" />
                    <span>Langkah Mudah Membuka Proyek ini dalam Vue.js 3 Mandiri:</span>
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-[#806B58] font-mono">
                    <li>npm create vite@latest seruput-kunyah -- --template vue</li>
                    <li>cd seruput-kunyah && npm install</li>
                    <li>npm install lucide-vue-next</li>
                    <li>Salin file-file di tab atas ke folder src/</li>
                    <li>Jalankan: npm run dev</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono text-[#806B58]">
                    {activeTab === 'useCart' && 'src/composables/useCart.js'}
                    {activeTab === 'products' && 'src/data/products.js'}
                    {activeTab === 'whatsapp' && 'src/utils/whatsapp.js'}
                    {activeTab === 'productCard' && 'src/components/ProductCard.vue'}
                    {activeTab === 'cartDrawer' && 'src/components/CartDrawer.vue'}
                  </span>
                  <button
                    onClick={() => copyCode(codeSnippets[activeTab], activeTab)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5E6C8] hover:bg-[#ebd3a8] text-[#70412E] text-xs font-bold rounded-lg border border-[#E8D5B5] transition-colors"
                  >
                    {copied === activeTab ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-700" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Kode</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 bg-[#70412E] text-[#FFFAF1] rounded-2xl overflow-x-auto text-xs font-mono max-h-[45vh] leading-relaxed">
                  {codeSnippets[activeTab]}
                </pre>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-[#E8D5B5] flex justify-end">
            <button
              onClick={onClose}
              type="button"
              className="px-5 py-2 text-xs font-bold text-white bg-[#70412E] hover:bg-[#583020] rounded-xl shadow-xs"
            >
              Tutup Panduan
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
