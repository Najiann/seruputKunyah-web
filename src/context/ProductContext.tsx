import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Product, BundleItem, ProductCategory } from '../types';
import {
  INITIAL_PRODUCTS,
  getStoredProducts,
  saveStoredProducts,
  calculateLowestPrice,
  calculateBundles,
  getAllMenuNames,
} from '../services/productService';

interface ProductContextType {
  products: Product[];
  bundles: BundleItem[];
  lowestPrice: number;
  menuOptions: string[];
  getProduct: (id: string) => Product | undefined;
  getProductsByCategory: (category: ProductCategory) => Product[];
  updateProductPrice: (id: string, newPrice: number) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  resetToDefault: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());

  // Listen to cross-component or window events if updated from other places
  useEffect(() => {
    const handleSync = () => {
      setProducts(getStoredProducts());
    };
    window.addEventListener('seruput-products-changed', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('seruput-products-changed', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Update a product's price in one single call
  const updateProductPrice = useCallback((id: string, newPrice: number) => {
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          return { ...p, price: Math.max(0, newPrice) };
        }
        return p;
      });
      saveStoredProducts(updated);
      return updated;
    });
  }, []);

  // Update arbitrary product properties (name, price, stock, description, etc.)
  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          return { ...p, ...updates };
        }
        return p;
      });
      saveStoredProducts(updated);
      return updated;
    });
  }, []);

  // Reset to initial baseline
  const resetToDefault = useCallback(() => {
    saveStoredProducts(INITIAL_PRODUCTS);
    setProducts(INITIAL_PRODUCTS);
  }, []);

  // Derived bundles (automatically recalculates when any product price changes)
  const bundles = useMemo(() => calculateBundles(products), [products]);

  // Derived lowest price (for Hero Section "Mulai RpX.XXX")
  const lowestPrice = useMemo(() => calculateLowestPrice(products), [products]);

  // Derived menu options (for Review modal and POS dropdown)
  const menuOptions = useMemo(() => getAllMenuNames(products), [products]);

  const getProduct = useCallback(
    (id: string) => products.find(p => p.id === id),
    [products]
  );

  const getProductsByCategory = useCallback(
    (category: ProductCategory) => {
      if (category === 'all') return products.filter(p => p.isActive !== false);
      return products.filter(p => p.category === category && p.isActive !== false);
    },
    [products]
  );

  return (
    <ProductContext.Provider
      value={{
        products,
        bundles,
        lowestPrice,
        menuOptions,
        getProduct,
        getProductsByCategory,
        updateProductPrice,
        updateProduct,
        resetToDefault,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
