"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type CartItem = {
  id: string;
  storeSlug: string;
  name: string;
  price: number;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string, storeSlug: string) => void;
  clearCart: (storeSlug?: string) => void;
  getStoreItems: (storeSlug: string) => CartItem[];
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "multi-store-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find(
        (p) => p.id === item.id && p.storeSlug === item.storeSlug
      );

      if (existing) {
        return prev.map((p) =>
          p.id === item.id && p.storeSlug === item.storeSlug
            ? { ...p, quantity: p.quantity + 1 }
            : p
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: string, storeSlug: string) => {
    setItems((prev) =>
      prev.filter((item) => !(item.id === id && item.storeSlug === storeSlug))
    );
  };

  const clearCart = (storeSlug?: string) => {
    if (!storeSlug) {
      setItems([]);
      return;
    }

    setItems((prev) => prev.filter((item) => item.storeSlug !== storeSlug));
  };

  const getStoreItems = (storeSlug: string) => {
    return items.filter((item) => item.storeSlug === storeSlug);
  };

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      clearCart,
      getStoreItems,
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}