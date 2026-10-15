/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { getStoreConfig } from './config/storeConfig';
import { StoreConfig } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductSection } from './components/ProductSection';
import { BundleSection } from './components/BundleSection';
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
  const { openCart } = useCart();

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
    <div className="min-h-screen flex flex-col bg-[#FFFAF1] text-[#70412E]">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Page Sections */}
      <main className="flex-1">
        {/* A. Hero Section */}
        <HeroSection onOrderNow={handleOrderNow} />

        {/* B. Product Menu Section */}
        <ProductSection />

        {/* C. Optional Bundles / Recommendation Packages */}
        <BundleSection />

        {/* D. Brand Story Section */}
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
    <CartProvider>
      <MainLayout />
    </CartProvider>
  );
}
