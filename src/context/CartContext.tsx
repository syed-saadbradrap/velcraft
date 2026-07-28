"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { ensureGuestToken } from "@/lib/api/guest-client";
import { apiClient } from "@/lib/api/client";
import {
  addLocalCartItem,
  clearLocalCart,
  getLocalCart,
  removeLocalCartItem,
  updateLocalCartItem,
} from "@/lib/cart/local-cart";
import type { AddCartItemPayload, Cart } from "@/types/commerce";

interface CartContextValue {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  refreshCart: () => Promise<void>;
  addItem: (payload: AddCartItemPayload) => Promise<void>;
  updateItemQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localMode, setLocalMode] = useState(false);

  const refreshCart = useCallback(async () => {
    ensureGuestToken();
    setIsLoading(true);

    try {
      const nextCart = await apiClient.getCart();
      setCart(nextCart);
      setLocalMode(false);
    } catch {
      setCart(getLocalCart());
      setLocalMode(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let active = true;

    queueMicrotask(() => {
      if (!active) {
        return;
      }

      void refreshCart();
    });

    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, refreshCart]);

  const addItem = useCallback(
    async (payload: AddCartItemPayload) => {
      ensureGuestToken();

      if (!localMode) {
        try {
          const nextCart = await apiClient.addCartItem(payload);
          setCart(nextCart);
          return;
        } catch {
          setLocalMode(true);
        }
      }

      const nextCart = addLocalCartItem(payload);
      setCart(nextCart);
    },
    [localMode],
  );

  const updateItemQuantity = useCallback(
    async (itemId: number, quantity: number) => {
      if (!localMode) {
        try {
          const nextCart = await apiClient.updateCartItem(itemId, quantity);
          setCart(nextCart);
          return;
        } catch {
          setLocalMode(true);
        }
      }

      const nextCart = updateLocalCartItem(itemId, quantity);
      setCart(nextCart);
    },
    [localMode],
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      if (!localMode) {
        try {
          const nextCart = await apiClient.removeCartItem(itemId);
          setCart(nextCart);
          return;
        } catch {
          setLocalMode(true);
        }
      }

      const nextCart = removeLocalCartItem(itemId);
      setCart(nextCart);
    },
    [localMode],
  );

  const clearCart = useCallback(async () => {
    if (!localMode) {
      try {
        const nextCart = await apiClient.clearCart();
        setCart(nextCart);
        return;
      } catch {
        setLocalMode(true);
      }
    }

    const nextCart = clearLocalCart();
    setCart(nextCart);
  }, [localMode]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isLoading,
      itemCount: cart?.totals.item_count ?? 0,
      refreshCart,
      addItem,
      updateItemQuantity,
      removeItem,
      clearCart,
    }),
    [cart, isLoading, refreshCart, addItem, updateItemQuantity, removeItem, clearCart],
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
