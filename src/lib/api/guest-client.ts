const GUEST_TOKEN_KEY = "guest_cart_token";
const GUEST_CHECKOUT_TOKEN_KEY = "guest_checkout_token";

export function getGuestToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(GUEST_TOKEN_KEY);
}

export function ensureGuestToken(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = getGuestToken();
  if (existing) {
    return existing;
  }

  const token = crypto.randomUUID();
  localStorage.setItem(GUEST_TOKEN_KEY, token);
  return token;
}

export function clearGuestToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(GUEST_TOKEN_KEY);
}

export function getGuestCheckoutToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(GUEST_CHECKOUT_TOKEN_KEY);
}

export function setGuestCheckoutToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(GUEST_CHECKOUT_TOKEN_KEY, token);
}

export function clearGuestCheckoutToken(): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(GUEST_CHECKOUT_TOKEN_KEY);
}

export function buildGuestHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const guestToken = getGuestToken();

  if (guestToken) {
    headers["X-Guest-Token"] = guestToken;
  }

  const checkoutToken = getGuestCheckoutToken();
  if (checkoutToken) {
    headers["X-Guest-Checkout-Token"] = checkoutToken;
  }

  return headers;
}
