import { fallbackShoes } from "@/lib/fallback/catalog";
import type { AddCartItemPayload, Cart, CartItem } from "@/types/commerce";

const STORAGE_KEY = "velcraft_local_cart";
const SHIPPING_FLAT = 25;

interface StoredCart {
  nextId: number;
  items: CartItem[];
}

function loadStored(): StoredCart {
  if (typeof window === "undefined") {
    return { nextId: 1, items: [] };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { nextId: 1, items: [] };
    }

    return JSON.parse(raw) as StoredCart;
  } catch {
    return { nextId: 1, items: [] };
  }
}

function saveStored(cart: StoredCart) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function computeTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
  const item_count = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    subtotal,
    discount_amount: 0,
    shipping_amount: item_count > 0 ? SHIPPING_FLAT : 0,
    total: subtotal + (item_count > 0 ? SHIPPING_FLAT : 0),
    item_count,
  };
}

function toCart(stored: StoredCart): Cart {
  return {
    id: 0,
    items: stored.items,
    totals: computeTotals(stored.items),
  };
}

function customizationKey(customization: CartItem["customization"]) {
  return JSON.stringify(customization);
}

export function getLocalCart(): Cart {
  return toCart(loadStored());
}

export function addLocalCartItem(payload: AddCartItemPayload): Cart {
  const stored = loadStored();
  const shoe = fallbackShoes.find((item) => item.id === payload.shoe_id);

  if (!shoe) {
    throw new Error("Product not found.");
  }

  const quantity = payload.quantity ?? 1;
  const unit_price = shoe.base_price;
  const key = customizationKey(payload.customization);
  const existing = stored.items.find(
    (item) => item.shoe_id === payload.shoe_id && customizationKey(item.customization) === key,
  );

  if (existing) {
    existing.quantity += quantity;
    existing.line_total = existing.unit_price * existing.quantity;
  } else {
    stored.items.push({
      id: stored.nextId,
      shoe_id: payload.shoe_id,
      quantity,
      customization: payload.customization,
      unit_price,
      line_total: unit_price * quantity,
      shoe,
    });
    stored.nextId += 1;
  }

  saveStored(stored);
  return toCart(stored);
}

export function updateLocalCartItem(itemId: number, quantity: number): Cart {
  const stored = loadStored();
  const item = stored.items.find((entry) => entry.id === itemId);

  if (!item) {
    return toCart(stored);
  }

  if (quantity <= 0) {
    stored.items = stored.items.filter((entry) => entry.id !== itemId);
  } else {
    item.quantity = quantity;
    item.line_total = item.unit_price * quantity;
  }

  saveStored(stored);
  return toCart(stored);
}

export function removeLocalCartItem(itemId: number): Cart {
  const stored = loadStored();
  stored.items = stored.items.filter((entry) => entry.id !== itemId);
  saveStored(stored);
  return toCart(stored);
}

export function clearLocalCart(): Cart {
  const empty: StoredCart = { nextId: 1, items: [] };
  saveStored(empty);
  return toCart(empty);
}

export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message === "Failed to fetch" ||
    error.name === "TypeError" ||
    error.message.toLowerCase().includes("network")
  );
}
