"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

interface CartProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  size: string;
  inStock: boolean;
}

interface CartItem {
  id: string;
  quantity: number;
  product: CartProduct;
}

interface CartTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}

interface CartContextType {
  items: CartItem[];
  totals: CartTotals;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const defaultTotals: CartTotals = {
  subtotal: 0,
  shipping: 0,
  tax: 0,
  total: 0,
  itemCount: 0,
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState<CartTotals>(defaultTotals);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      if (data.success) {
        setItems(data.data.items);
        setTotals(data.data.totals);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity = 1) => {
    const res = await fetch("/api/cart/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    const data = await res.json();
    if (data.success) {
      await refreshCart();
    } else {
      throw new Error(data.error);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const res = await fetch("/api/cart/items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity }),
    });
    if (res.ok) await refreshCart();
  };

  const removeItem = async (itemId: string) => {
    await fetch(`/api/cart/items?itemId=${itemId}`, { method: "DELETE" });
    await refreshCart();
  };

  const clearCart = async () => {
    await fetch("/api/cart", { method: "DELETE" });
    await refreshCart();
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totals,
        loading,
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
