'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem } from '@/types';

export interface VerifiedCartItem extends CartItem {
  originalPrice?: number;
  isSale?: boolean;
  totalPrice?: number;
  availableStock?: number;
}

interface CartContextType {
  items: CartItem[];
  verifiedItems: VerifiedCartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (productId: string, volume: string) => void;
  updateQuantity: (productId: string, volume: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  warnings: string[];
  clearWarnings: () => void;
  isValidating: boolean;
  giftWrap: boolean;
  setGiftWrap: (wrap: boolean) => void;
  selectedSamples: string[];
  toggleSample: (sampleName: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [verifiedItems, setVerifiedItems] = useState<VerifiedCartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [giftWrap, setGiftWrap] = useState(true);
  const [selectedSamples, setSelectedSamples] = useState<string[]>([
    'Oud Nocturne (2ml Vial)',
    'Santal Impérial (2ml Vial)',
  ]);
  const [isMounted, setIsMounted] = useState(false);

  // Server-verified financials
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Server validation routine
  const validateCartOnServer = useCallback(async (currentItems: CartItem[]) => {
    if (currentItems.length === 0) {
      setVerifiedItems([]);
      setSubtotal(0);
      setShipping(0);
      setTax(0);
      setTotal(0);
      return;
    }

    setIsValidating(true);
    try {
      const res = await fetch('/api/cart/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: currentItems.map((i) => ({
            productId: i.productId,
            volume: i.volume,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setVerifiedItems(data.items);
        setSubtotal(data.subtotal);
        setShipping(data.shipping);
        setTax(data.tax);
        setTotal(data.total);

        if (data.warnings && data.warnings.length > 0) {
          setWarnings((prev) => Array.from(new Set([...prev, ...data.warnings])));
        }

        // Sync back any clamped quantities or updated prices into client items
        const syncedItems: CartItem[] = data.items.map((vi: any) => ({
          productId: vi.productId,
          productName: vi.productName,
          productImage: vi.productImage,
          price: vi.unitPrice, // True server verified price!
          volume: vi.volume,
          slug: vi.slug,
          quantity: vi.quantity, // True clamped stock quantity!
        }));

        setItems(syncedItems);
        localStorage.setItem('fragrea_cart', JSON.stringify(syncedItems));
      }
    } catch (err) {
      console.error('Failed to validate cart with server:', err);
    } finally {
      setIsValidating(false);
    }
  }, []);

  // 1. Initial hydration from localStorage
  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('fragrea_cart');
    if (stored) {
      try {
        const parsed: CartItem[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
          validateCartOnServer(parsed);
        }
      } catch (e) {
        console.error('Failed to parse cart storage', e);
      }
    }
  }, [validateCartOnServer]);

  // 2. Add product to cart
  const addToCart = (newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const qty = newItem.quantity || 1;
    let nextItems: CartItem[];

    const existingIdx = items.findIndex(
      (i) => i.productId === newItem.productId && i.volume === newItem.volume
    );

    if (existingIdx > -1) {
      nextItems = [...items];
      nextItems[existingIdx] = {
        ...nextItems[existingIdx],
        quantity: nextItems[existingIdx].quantity + qty,
      };
    } else {
      nextItems = [...items, { ...newItem, quantity: qty }];
    }

    setItems(nextItems);
    localStorage.setItem('fragrea_cart', JSON.stringify(nextItems));
    validateCartOnServer(nextItems);
    setIsCartOpen(true);
  };

  // 3. Remove product from cart
  const removeFromCart = (productId: string, volume: string) => {
    const nextItems = items.filter(
      (i) => !(i.productId === productId && i.volume === volume)
    );
    setItems(nextItems);
    localStorage.setItem('fragrea_cart', JSON.stringify(nextItems));
    validateCartOnServer(nextItems);
  };

  // 4. Update quantity
  const updateQuantity = (productId: string, volume: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, volume);
      return;
    }

    const nextItems = items.map((item) =>
      item.productId === productId && item.volume === volume
        ? { ...item, quantity }
        : item
    );

    setItems(nextItems);
    localStorage.setItem('fragrea_cart', JSON.stringify(nextItems));
    validateCartOnServer(nextItems);
  };

  const clearCart = () => {
    setItems([]);
    setVerifiedItems([]);
    setSubtotal(0);
    setShipping(0);
    setTax(0);
    setTotal(0);
    setWarnings([]);
    localStorage.removeItem('fragrea_cart');
  };

  const clearWarnings = () => {
    setWarnings([]);
  };

  const toggleSample = (sampleName: string) => {
    setSelectedSamples((prev) => {
      if (prev.includes(sampleName)) {
        return prev.filter((s) => s !== sampleName);
      }
      if (prev.length >= 2) {
        return [prev[1], sampleName];
      }
      return [...prev, sampleName];
    });
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        verifiedItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        shipping,
        tax,
        total,
        warnings,
        clearWarnings,
        isValidating,
        giftWrap,
        setGiftWrap,
        selectedSamples,
        toggleSample,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
