/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ProductProvider } from './context/ProductContext';
import { CartProvider, useCart } from './context/CartContext';
import { getStoreConfig } from './config/storeConfig';
import { StoreConfig } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductSection } from './components/ProductSection';
import { BrandStory } from './components/BrandStory';
import { OrderSteps } from './components/OrderSteps';
import { ReviewSection } from './components/ReviewSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { FloatingControls } from './components/FloatingControls';
import { DevAdminModal } from './components/DevAdminModal';
import { getCustomerReviews } from './data/reviews';
import { CustomerReview } from './types';

function MainLayout() {
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(getStoreConfig());
  const [reviews, setReviews] = useState<CustomerReview[]>(getCustomerReviews());
  const [isDevAdminOpen, setIsDevAdminOpen] = useState(false);
  const [isGmpQuotaExceeded, setIsGmpQuotaExceeded] = useState(false);
  const { openCart } = useCart();

  // Listen for Google Maps Platform quota limit events (Tier 1 & Tier 2)
  useEffect(() => {
    const handleQuotaExceeded = () => {
      setIsGmpQuotaExceeded(true);
    };
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Keyboard shortcut Shift + A to open secret Developer & Admin Panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        const tag = (e.target as HTMLElement)?.tagName;
        // Don't intercept when user is typing text in an input or textarea
        if (tag === 'INPUT' || tag === 'TEXTAREA') {
          return;
        }
        e.preventDefault();
        setIsDevAdminOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Also support ?admin=true or ?dev=true in URL for easy phone/tablet access
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || params.get('dev') === 'true') {
        setIsDevAdminOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleOrderNow = () => {
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      openCart();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCF6E0] text-[#C7320B]">
      {isGmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar />

      {/* Main Page Sections */}
      <main className="flex-1">
        {/* A. Hero Section */}
        <HeroSection onOrderNow={handleOrderNow} />

        {/* B. Product Menu Section */}
        <ProductSection />

        {/* C. Brand Story Section */}
        <BrandStory />

        {/* E. How To Order (4 Steps) */}
        <OrderSteps />

        {/* F. Customer Reviews, Ratings & Feedback */}
        <ReviewSection
          reviews={reviews}
          onReviewAdded={updated => setReviews(updated)}
          storeConfig={storeConfig}
        />

        {/* G. Contact & Service Area */}
        <ContactSection storeConfig={storeConfig} />
      </main>

      {/* G. Footer with secret 5-tap developer trigger for mobile presentation */}
      <Footer
        storeConfig={storeConfig}
        onTriggerSecretDev={() => setIsDevAdminOpen(true)}
      />

      {/* Interactive Cart Slide-Over Drawer */}
      <CartDrawer
        storeConfig={storeConfig}
        onOpenConfig={() => setIsDevAdminOpen(true)}
      />

      {/* Floating Action Controls (WhatsApp & Mobile Cart) */}
      <FloatingControls storeConfig={storeConfig} />

      {/* Unified Secret Developer & Admin Modal (Shift + A / 5-Tap / URL param) */}
      <DevAdminModal
        isOpen={isDevAdminOpen}
        onClose={() => setIsDevAdminOpen(false)}
        currentConfig={storeConfig}
        onSaveConfig={updated => setStoreConfig(updated)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <MainLayout />
      </CartProvider>
    </ProductProvider>
  );
}
