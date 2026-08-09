import {
  authFetch,
  authFetchMessage,
  authUpload,
  clearToken,
  setToken,
} from "@/lib/api/auth-client";
import {
  clearGuestCheckoutToken,
  clearGuestToken,
  setGuestCheckoutToken,
} from "@/lib/api/guest-client";
import { siteConfig } from "@/config/site";
import {
  fallbackCollections,
  fallbackPaginatedShoes,
  getFallbackShoeDetail,
} from "@/lib/fallback/catalog";
import { fallbackContactPage } from "@/lib/fallback/contact";
import { fallbackHomepageData } from "@/lib/fallback/homepage";
import type {
  ApiResponse,
  CollectionSummary,
  ContactFormPayload,
  ContactPageData,
  HomepageData,
  PaginatedShoes,
  ShoeDetail,
} from "@/types/api";
import type {
  AddCartItemPayload,
  AdminCoupon,
  AdminCustomer,
  AdminCustomerDetail,
  AdminDashboard,
  AdminProductOptions,
  AdminShoe,
  AdminShoeInput,
  AdminUploadResult,
  AuthPayload,
  Cart,
  CheckoutPayload,
  ContactMessage,
  CouponValidation,
  LoginPayload,
  Order,
  PaginatedAdmin,
  PaginatedOrders,
  PaymentConfirmPayload,
  PayFastCheckoutPayload,
  PayFastCheckoutSession,
  PayFastStatusPayload,
  PayFastVerifyPayload,
  RegisterPayload,
  ShippingAddress,
  ShippingAddressInput,
  StripeIntentPayload,
  User,
  WishlistItem,
  WishlistPayload,
} from "@/types/commerce";

class ApiClient {
  private readonly baseUrl = siteConfig.apiUrl;

  private async request<T>(path: string, init?: RequestInit, cache: RequestCache = "no-store"): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      cache: init?.method && init.method !== "GET" ? undefined : cache,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const payload = (await response.json()) as ApiResponse<T>;

    if (!payload.success) {
      throw new Error(payload.message || "API request failed");
    }

    return payload.data;
  }

  async getHomepage(): Promise<HomepageData> {
    try {
      return await this.request<HomepageData>("/homepage");
    } catch {
      return fallbackHomepageData;
    }
  }

  async getCollections(): Promise<CollectionSummary[]> {
    try {
      return await this.request<CollectionSummary[]>("/collections");
    } catch {
      return fallbackCollections;
    }
  }

  async getShoes(collectionSlug?: string, page = 1): Promise<PaginatedShoes> {
    try {
      const params = new URLSearchParams({ page: String(page), per_page: "12" });
      if (collectionSlug) {
        params.set("collection", collectionSlug);
      }
      return await this.request<PaginatedShoes>(`/shoes?${params.toString()}`);
    } catch {
      const items = collectionSlug
        ? fallbackPaginatedShoes.items.filter(
            (shoe) => shoe.collection?.slug === collectionSlug,
          )
        : fallbackPaginatedShoes.items;

      return {
        items,
        pagination: {
          ...fallbackPaginatedShoes.pagination,
          total: items.length,
        },
      };
    }
  }

  async getShoe(slug: string): Promise<ShoeDetail | null> {
    try {
      return await this.request<ShoeDetail>(`/shoes/${slug}`);
    } catch {
      return getFallbackShoeDetail(slug);
    }
  }

  async getContactPage(): Promise<ContactPageData> {
    try {
      return await this.request<ContactPageData>("/contact");
    } catch {
      return fallbackContactPage;
    }
  }

  async submitContact(payload: ContactFormPayload): Promise<string> {
    const response = await fetch(`${this.baseUrl}/contact`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const body = (await response.json()) as ApiResponse<null>;

    if (!response.ok || !body.success) {
      throw new Error(body.message || "Unable to send message.");
    }

    return body.message;
  }

  async login(payload: LoginPayload): Promise<AuthPayload> {
    const data = await authFetch<AuthPayload>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }, { auth: false });

    setToken(data.token);
    return data;
  }

  async register(payload: RegisterPayload): Promise<AuthPayload> {
    const data = await authFetch<AuthPayload>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }, { auth: false });

    setToken(data.token);
    return data;
  }

  async me(): Promise<User> {
    return authFetch<User>("/auth/me");
  }

  async logout(): Promise<void> {
    try {
      await authFetch<null>("/auth/logout", { method: "POST" });
    } finally {
      clearToken();
    }
  }

  async getCart(): Promise<Cart> {
    return authFetch<Cart>("/cart");
  }

  async addCartItem(payload: AddCartItemPayload): Promise<Cart> {
    const { data } = await authFetchMessage<{ item: unknown; cart: Cart }>("/cart/items", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return data.cart;
  }

  async updateCartItem(id: number, quantity: number): Promise<Cart> {
    const { data } = await authFetchMessage<{ item: unknown; cart: Cart }>(
      `/cart/items/${id}`,
      {
        method: "PUT",
        body: JSON.stringify({ quantity }),
      },
    );

    return data.cart;
  }

  async removeCartItem(id: number): Promise<Cart> {
    return authFetch<Cart>(`/cart/items/${id}`, { method: "DELETE" });
  }

  async clearCart(): Promise<Cart> {
    return authFetch<Cart>("/cart", { method: "DELETE" });
  }

  async getWishlist(): Promise<WishlistItem[]> {
    return authFetch<WishlistItem[]>("/wishlist");
  }

  async addWishlistItem(payload: WishlistPayload): Promise<WishlistItem> {
    return authFetch<WishlistItem>("/wishlist", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async removeWishlistItem(id: number): Promise<void> {
    await authFetch<null>(`/wishlist/${id}`, { method: "DELETE" });
  }

  async validateCoupon(code: string, subtotal?: number): Promise<CouponValidation> {
    return authFetch<CouponValidation>("/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code, subtotal }),
    });
  }

  async getShippingAddresses(): Promise<ShippingAddress[]> {
    return authFetch<ShippingAddress[]>("/shipping-addresses");
  }

  async createShippingAddress(payload: ShippingAddressInput): Promise<ShippingAddress> {
    return authFetch<ShippingAddress>("/shipping-addresses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateShippingAddress(
    id: number,
    payload: Partial<ShippingAddressInput>,
  ): Promise<ShippingAddress> {
    return authFetch<ShippingAddress>(`/shipping-addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async deleteShippingAddress(id: number): Promise<void> {
    await authFetch<null>(`/shipping-addresses/${id}`, { method: "DELETE" });
  }

  async checkout(payload: CheckoutPayload): Promise<Order> {
    const order = await authFetch<Order>("/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (order.guest_checkout_token) {
      setGuestCheckoutToken(order.guest_checkout_token);
      clearGuestToken();
    }

    return order;
  }

  async getOrders(page = 1, perPage = 10): Promise<PaginatedOrders> {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });

    return authFetch<PaginatedOrders>(`/orders?${params.toString()}`);
  }

  async getOrder(id: number): Promise<Order> {
    return authFetch<Order>(`/orders/${id}`);
  }

  async createStripeIntent(orderId: number): Promise<StripeIntentPayload> {
    return authFetch<StripeIntentPayload>("/payments/stripe/intent", {
      method: "POST",
      body: JSON.stringify({ order_id: orderId }),
    });
  }

  async getPayfastStatus(): Promise<PayFastStatusPayload> {
    try {
      return await authFetch<PayFastStatusPayload>("/payments/payfast/status");
    } catch {
      return { enabled: false, mode: "sandbox" };
    }
  }

  async createPayfastCheckout(payload: PayFastCheckoutPayload): Promise<PayFastCheckoutSession> {
    return authFetch<PayFastCheckoutSession>("/payments/payfast/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async verifyPayfastReturn(payload: PayFastVerifyPayload): Promise<Order> {
    const order = await authFetch<Order>("/payments/payfast/verify", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    clearGuestCheckoutToken();

    return order;
  }

  async confirmPayment(payload: PaymentConfirmPayload): Promise<Order> {
    const order = await authFetch<Order>("/payments/confirm", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    clearGuestCheckoutToken();

    return order;
  }

  async getAdminDashboard(): Promise<AdminDashboard> {
    return authFetch<AdminDashboard>("/admin/dashboard");
  }

  async getAdminOrders(params?: {
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedAdmin<Order>> {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    if (params?.per_page) query.set("per_page", String(params.per_page));

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return authFetch<PaginatedAdmin<Order>>(`/admin/orders${suffix}`);
  }

  async getAdminOrder(id: number): Promise<Order> {
    return authFetch<Order>(`/admin/orders/${id}`);
  }

  async updateAdminOrderStatus(id: number, status: string): Promise<Order> {
    return authFetch<Order>(`/admin/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async getAdminCustomers(params?: {
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedAdmin<AdminCustomer>> {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    if (params?.per_page) query.set("per_page", String(params.per_page));

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return authFetch<PaginatedAdmin<AdminCustomer>>(`/admin/customers${suffix}`);
  }

  async getAdminCustomer(id: number): Promise<AdminCustomerDetail> {
    return authFetch<AdminCustomerDetail>(`/admin/customers/${id}`);
  }

  async getAdminContactMessages(params?: {
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedAdmin<ContactMessage>> {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    if (params?.per_page) query.set("per_page", String(params.per_page));

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return authFetch<PaginatedAdmin<ContactMessage>>(`/admin/contact-messages${suffix}`);
  }

  async updateAdminContactMessage(
    id: number,
    status: ContactMessage["status"],
  ): Promise<ContactMessage> {
    return authFetch<ContactMessage>(`/admin/contact-messages/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  async getAdminCoupons(params?: {
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedAdmin<AdminCoupon>> {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    if (params?.per_page) query.set("per_page", String(params.per_page));

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return authFetch<PaginatedAdmin<AdminCoupon>>(`/admin/coupons${suffix}`);
  }

  async createAdminCoupon(payload: Omit<AdminCoupon, "id" | "used_count" | "created_at">): Promise<AdminCoupon> {
    return authFetch<AdminCoupon>("/admin/coupons", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateAdminCoupon(
    id: number,
    payload: Partial<Omit<AdminCoupon, "id" | "used_count" | "created_at">>,
  ): Promise<AdminCoupon> {
    return authFetch<AdminCoupon>(`/admin/coupons/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async deleteAdminCoupon(id: number): Promise<void> {
    await authFetch<null>(`/admin/coupons/${id}`, { method: "DELETE" });
  }

  async getAdminCollections(): Promise<CollectionSummary[]> {
    return authFetch<CollectionSummary[]>("/admin/collections");
  }

  async getAdminProductOptions(): Promise<AdminProductOptions> {
    return authFetch<AdminProductOptions>("/admin/product-options");
  }

  async createAdminMaterial(payload: { name: string }): Promise<AdminProductOptions["materials"][number]> {
    return authFetch("/admin/product-options/materials", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async deleteAdminMaterial(id: number): Promise<void> {
    await authFetch<null>(`/admin/product-options/materials/${id}`, { method: "DELETE" });
  }

  async createAdminColor(payload: { name: string; hex_code: string }): Promise<AdminProductOptions["colors"][number]> {
    return authFetch("/admin/product-options/colors", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async deleteAdminColor(id: number): Promise<void> {
    await authFetch<null>(`/admin/product-options/colors/${id}`, { method: "DELETE" });
  }

  async createAdminSize(payload: {
    gender: "men" | "women";
    value: number;
    label?: string;
  }): Promise<AdminProductOptions["sizes"][number]> {
    return authFetch("/admin/product-options/sizes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async deleteAdminSize(id: number): Promise<void> {
    await authFetch<null>(`/admin/product-options/sizes/${id}`, { method: "DELETE" });
  }

  async createAdminBuckle(payload: { name: string }): Promise<AdminProductOptions["buckles"][number]> {
    return authFetch("/admin/product-options/buckles", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async deleteAdminBuckle(id: number): Promise<void> {
    await authFetch<null>(`/admin/product-options/buckles/${id}`, { method: "DELETE" });
  }

  async getAdminShoes(params?: {
    search?: string;
    collection_id?: number;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedAdmin<AdminShoe>> {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.collection_id) query.set("collection_id", String(params.collection_id));
    if (params?.page) query.set("page", String(params.page));
    if (params?.per_page) query.set("per_page", String(params.per_page));

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return authFetch<PaginatedAdmin<AdminShoe>>(`/admin/shoes${suffix}`);
  }

  async getAdminShoe(id: number): Promise<AdminShoe> {
    return authFetch<AdminShoe>(`/admin/shoes/${id}`);
  }

  async createAdminShoe(payload: AdminShoeInput): Promise<AdminShoe> {
    return authFetch<AdminShoe>("/admin/shoes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateAdminShoe(id: number, payload: Partial<AdminShoeInput>): Promise<AdminShoe> {
    return authFetch<AdminShoe>(`/admin/shoes/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async deleteAdminShoe(id: number): Promise<void> {
    await authFetch<null>(`/admin/shoes/${id}`, { method: "DELETE" });
  }

  async uploadAdminImage(file: File): Promise<AdminUploadResult> {
    const formData = new FormData();
    formData.append("image", file);
    return authUpload<AdminUploadResult>("/admin/uploads/image", formData);
  }
}

export const apiClient = new ApiClient();
