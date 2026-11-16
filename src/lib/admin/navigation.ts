export type AdminNavIcon =
  | "dashboard"
  | "products"
  | "orders"
  | "customers"
  | "messages"
  | "coupons"
  | "content"
  | "settings"
  | "media";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: AdminNavIcon;
  description: string;
}

export const adminNavigation: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: "dashboard",
    description: "Overview & analytics",
  },
  {
    label: "Content",
    href: "/admin/content",
    icon: "content",
    description: "Homepage & page copy",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: "settings",
    description: "Brand, contact, nav",
  },
  {
    label: "Media",
    href: "/admin/media",
    icon: "media",
    description: "Image uploads",
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: "products",
    description: "Catalog management",
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: "orders",
    description: "Fulfillment queue",
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: "customers",
    description: "Registered accounts",
  },
  {
    label: "Messages",
    href: "/admin/contact-messages",
    icon: "messages",
    description: "Concierge inbox",
  },
  {
    label: "Coupons",
    href: "/admin/coupons",
    icon: "coupons",
    description: "Promotions & discounts",
  },
];

export function getAdminPageMeta(pathname: string): AdminNavItem | undefined {
  return adminNavigation.find((item) => pathname.startsWith(item.href));
}
