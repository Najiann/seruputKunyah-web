import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, CartItem } from '../types';
import { PRODUCTS } from '../data/products';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, notes?: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerNote: string;
  setCustomerNote: (note: string) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  totalPrice: number;
  toastMessage: string | null;
  clearToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'seruput_kunyah_cart_v1';
const NAME_STORAGE_KEY = 'seruput_kunyah_customer_name';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Array<{ productId: string; quantity: number; notes?: string }>;
        // Re-hydrate with current product data from single source of truth
        const hydrated: CartItem[] = [];
        parsed.forEach(entry => {
          const product = PRODUCTS.find(p => p.id === entry.productId);
          if (product && entry.quantity > 0) {
            hydrated.push({
              product,
              quantity: entry.quantity,
              notes: entry.notes || '',
            });
          }
        });
        return hydrated;
      }
    } catch (e) {
      console.warn('Could not restore cart from storage', e);
    }
    return [];
  });

  const [customerName, setCustomerNameState] = useState<string>(() => {
    try {
      return localStorage.getItem(NAME_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  const setCustomerName = (name: string) => {
    setCustomerNameState(name);
    try {
      localStorage.setItem(NAME_STORAGE_KEY, name);
    } catch {
      // ignore
    }
  };

  const [customerNote, setCustomerNote] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      const minimal = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        notes: item.notes,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  };

  const addToCart = (product: Product, quantity: number = 1, notes: string = '') => {
    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const next = [...prevItems];
        const newQty = next[existingIndex].quantity + quantity;
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQty,
          notes: notes || next[existingIndex].notes,
        };
        return next;
      } else {
        return [...prevItems, { product, quantity, notes }];
      }
    });

    showToast(`✓ ${product.name} (${quantity}x) dimasukkan ke keranjang`);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setItems(prevItems => {
      return prevItems
        .map(item => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [items]);

  const totalPrice = useMemo(() => {
    return items.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        customerName,
        setCustomerName,
        customerNote,
        setCustomerNote,
        isCartOpen,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        totalItems,
        totalPrice,
        toastMessage,
        clearToast: () => setToastMessage(null),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
