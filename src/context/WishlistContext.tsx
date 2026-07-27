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
import { apiClient } from "@/lib/api/client";
import type { ShoeSummary } from "@/types/api";
import type { WishlistItem } from "@/types/commerce";

const STORAGE_KEY = "velcraft_wishlist_v1";

export interface WishlistEntry {
  id?: number;
  shoe_id: number;
  shoe: ShoeSummary;
  created_at: string;
}

interface WishlistContextValue {
  items: WishlistEntry[];
  itemCount: number;
  isLoading: boolean;
  isWishlisted: (shoeId: number) => boolean;
  toggleWishlist: (shoe: ShoeSummary) => Promise<void>;
  removeWishlist: (shoeId: number) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readLocalWishlist(): WishlistEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WishlistEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalWishlist(items: WishlistEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function toEntry(item: WishlistItem): WishlistEntry {
  return {
    id: item.id,
    shoe_id: item.shoe_id,
    shoe: item.shoe,
    created_at: item.created_at,
  };
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<WishlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshWishlist = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const remote = await apiClient.getWishlist();
        const next = remote.map(toEntry);
        setItems(next);
        writeLocalWishlist(next);
        return;
      } catch {
        setItems(readLocalWishlist());
        return;
      }
    }

    setItems(readLocalWishlist());
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;

    void (async () => {
      setIsLoading(true);
      await refreshWishlist();
      setIsLoading(false);
    })();
  }, [authLoading, isAuthenticated, refreshWishlist]);

  const isWishlisted = useCallback(
    (shoeId: number) => items.some((item) => item.shoe_id === shoeId),
    [items],
  );

  const toggleWishlist = useCallback(
    async (shoe: ShoeSummary) => {
      const exists = items.some((item) => item.shoe_id === shoe.id);

      if (exists) {
        const existing = items.find((item) => item.shoe_id === shoe.id);
        const next = items.filter((item) => item.shoe_id !== shoe.id);
        setItems(next);
        writeLocalWishlist(next);

        if (isAuthenticated && existing?.id) {
          try {
            await apiClient.removeWishlistItem(existing.id);
          } catch {
            await refreshWishlist();
          }
        }
        return;
      }

      const entry: WishlistEntry = {
        shoe_id: shoe.id,
        shoe,
        created_at: new Date().toISOString(),
      };

      if (isAuthenticated) {
        try {
          const created = await apiClient.addWishlistItem({ shoe_id: shoe.id });
          const next = [toEntry(created), ...items.filter((item) => item.shoe_id !== shoe.id)];
          setItems(next);
          writeLocalWishlist(next);
          return;
        } catch {
          /* fall through to local */
        }
      }

      const next = [entry, ...items];
      setItems(next);
      writeLocalWishlist(next);
    },
    [items, isAuthenticated, refreshWishlist],
  );

  const removeWishlist = useCallback(
    async (shoeId: number) => {
      const existing = items.find((item) => item.shoe_id === shoeId);
      const next = items.filter((item) => item.shoe_id !== shoeId);
      setItems(next);
      writeLocalWishlist(next);

      if (isAuthenticated && existing?.id) {
        try {
          await apiClient.removeWishlistItem(existing.id);
        } catch {
          await refreshWishlist();
        }
      }
    },
    [items, isAuthenticated, refreshWishlist],
  );

  const value = useMemo(
    () => ({
      items,
      itemCount: items.length,
      isLoading,
      isWishlisted,
      toggleWishlist,
      removeWishlist,
      refreshWishlist,
    }),
    [items, isLoading, isWishlisted, toggleWishlist, removeWishlist, refreshWishlist],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}
