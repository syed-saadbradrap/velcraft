import type { PaginationMeta, ShoeSummary } from "@/types/api";
import type { CustomizationSelection, ShoeType } from "@/types/customization";

export type UserRole = "admin" | "customer";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
}

export interface AuthPayload {
  user: User;
  token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface ApiCustomization {
  material_id: number;
  color_hex: string;
  sole_color_hex: string;
  buckle_id: number;
  shoe_type: ShoeType;
  size_id: number;
}

export interface CartTotals {
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  total: number;
  item_count: number;
}

export interface CartItem {
  id: number;
  shoe_id: number;
  quantity: number;
  customization: ApiCustomization;
  unit_price: number;
  line_total: number;
  shoe: ShoeSummary;
}

export interface Cart {
  id: number;
  items: CartItem[];
  totals: CartTotals;
}

export interface AddCartItemPayload {
  shoe_id: number;
  quantity?: number;
  customization: ApiCustomization;
}

export interface WishlistItem {
  id: number;
  shoe_id: number;
  customization: ApiCustomization | null;
  shoe: ShoeSummary;
  created_at: string;
}

export interface WishlistPayload {
  shoe_id: number;
  customization?: ApiCustomization;
}

export interface CouponValidation {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_order_amount: number;
  discount_amount: number;
}

export interface ShippingAddress {
  id: number;
  full_name: string;
  phone?: string | null;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state?: string | null;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export type ShippingAddressInput = Omit<ShippingAddress, "id" | "is_default"> & {
  is_default?: boolean;
};

export type PaymentMethod = "stripe" | "payfast" | "cod" | "bank_transfer";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  id: number;
  shoe_id: number;
  shoe_name: string;
  quantity: number;
  customization: ApiCustomization;
  unit_price: number;
  total_price: number;
  shoe?: ShoeSummary;
}

export interface Order {
  id: number;
  order_number: string;
  guest_email?: string | null;
  guest_checkout_token?: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  total: number;
  shipping_address: Omit<ShippingAddress, "id" | "is_default">;
  notes?: string | null;
  coupon?: {
    id: number;
    code: string;
    type: "percentage" | "fixed";
    value: number;
  } | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedOrders {
  items: Order[];
  pagination: PaginationMeta;
}

export interface CheckoutPayload {
  guest_email?: string;
  shipping_address_id?: number;
  shipping_address?: ShippingAddressInput;
  payment_method: PaymentMethod;
  coupon_code?: string;
  notes?: string;
}

export interface StripeIntentPayload {
  client_secret: string;
  payment_intent_id: string;
  publishable_key: string;
  order: Order;
}

export interface PaymentConfirmPayload {
  order_id: number;
  payment_method: PaymentMethod;
  payment_intent_id?: string;
}

export interface PayFastCheckoutPayload {
  order_id: number;
  customer_email: string;
  customer_mobile: string;
}

export interface PayFastCheckoutSession {
  checkout_url: string;
  basket_id: string;
  amount: number;
  fields: Record<string, string>;
}

export interface PayFastVerifyPayload {
  order_number: string;
  signature?: string;
  status: "success" | "failure";
  transaction_id?: string;
}

export interface PayFastStatusPayload {
  enabled: boolean;
  mode: string;
}

export interface AdminDashboard {
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
  };
  customers: number;
  shoes: number;
  active_shoes: number;
  coupons: { total: number; active: number };
  contact_messages: { total: number; new: number };
  revenue: { total: number; month: number };
  recent_orders: Array<{
    id: number;
    order_number: string;
    customer_name: string;
    total: number;
    status: string;
    payment_status: string;
    created_at: string;
  }>;
  recent_messages: Array<{
    id: number;
    name: string;
    email: string;
    subject?: string | null;
    status: "new" | "read" | "replied" | "archived";
    created_at: string;
  }>;
}

export interface AdminCustomer {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  orders_count: number;
  created_at: string;
}

export interface AdminCustomerDetail {
  customer: AdminCustomer;
  recent_orders: Order[];
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  created_at: string;
  updated_at: string;
}

export interface AdminCoupon {
  id: number;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at?: string | null;
  created_at: string;
}

export interface PaginatedAdmin<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface AdminShoe {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  base_price: number;
  thumbnail_url?: string | null;
  thumbnail_path?: string | null;
  is_featured: boolean;
  is_active?: boolean;
  sort_order?: number;
  collection_id?: number | null;
  collection?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  supported_types?: string[];
  body_model_path?: string | null;
  sole_model_path?: string | null;
  logo_model_path?: string | null;
  inner_model_path?: string | null;
  default_buckle_model_path?: string | null;
  material_ids?: number[];
  color_ids?: number[];
  buckle_ids?: number[];
  size_ids?: number[];
}

export interface AdminShoeInput {
  collection_id?: number | null;
  name: string;
  slug?: string;
  description?: string | null;
  base_price: number;
  thumbnail_path?: string | null;
  body_model_path: string;
  sole_model_path: string;
  logo_model_path?: string | null;
  inner_model_path?: string | null;
  default_buckle_model_path?: string | null;
  supported_types?: string[];
  is_featured?: boolean;
  is_active?: boolean;
  sort_order?: number;
  material_ids?: number[];
  color_ids?: number[];
  buckle_ids?: number[];
  size_ids?: number[];
}

export interface AdminProductOptions {
  materials: Array<{ id: number; name: string; slug: string }>;
  colors: Array<{ id: number; name: string; hex_code: string }>;
  buckles: Array<{ id: number; name: string; slug: string }>;
  sizes: Array<{ id: number; gender: string; label: string; value: number }>;
}

export interface AdminUploadResult {
  path: string;
  url: string;
}

export function selectionToApiCustomization(
  selection: CustomizationSelection,
): ApiCustomization {
  return {
    material_id: selection.materialId!,
    color_hex: selection.colorHex,
    sole_color_hex: selection.soleColorHex,
    buckle_id: selection.buckleId!,
    shoe_type: selection.shoeType,
    size_id: selection.sizeId!,
  };
}

export function isCustomizationComplete(selection: CustomizationSelection): boolean {
  return (
    selection.materialId !== null &&
    selection.buckleId !== null &&
    selection.sizeId !== null &&
    selection.colorHex.length > 0 &&
    selection.soleColorHex.length > 0
  );
}
