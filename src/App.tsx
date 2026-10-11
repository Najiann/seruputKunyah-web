/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CartProvider, useCart } from './context/CartContext';
import { getStoreConfig } from './config/storeConfig';
import { StoreConfig } from './types';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductSection } from './components/ProductSection';
import { BundleSection } from './components/BundleSection';
import { BrandStory } from './components/BrandStory';
import { OrderSteps } from './components/OrderSteps';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { FloatingControls } from './components/FloatingControls';
import { StoreConfigModal } from './components/StoreConfigModal';
import { VuePortfolioModal } from './components/VuePortfolioModal';

function MainLayout() {
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(getStoreConfig());
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isVueGuideOpen, setIsVueGuideOpen] = useState(false);
  const { openCart } = useCart();

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
      <Navbar
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenVueGuide={() => setIsVueGuideOpen(true)}
      />

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

        {/* F. Contact & Service Area */}
        <ContactSection
          storeConfig={storeConfig}
          onOpenConfig={() => setIsConfigOpen(true)}
        />
      </main>

      {/* G. Footer */}
      <Footer storeConfig={storeConfig} />

      {/* Interactive Cart Slide-Over Drawer */}
      <CartDrawer
        storeConfig={storeConfig}
        onOpenConfig={() => setIsConfigOpen(true)}
      />

      {/* Floating Action Controls (WhatsApp & Mobile Cart) */}
      <FloatingControls storeConfig={storeConfig} />

      {/* Store Configuration Modal */}
      <StoreConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        currentConfig={storeConfig}
        onSave={updated => setStoreConfig(updated)}
      />

      {/* Vue.js 3 Portfolio Architecture & Migration Modal */}
      <VuePortfolioModal
        isOpen={isVueGuideOpen}
        onClose={() => setIsVueGuideOpen(false)}
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
