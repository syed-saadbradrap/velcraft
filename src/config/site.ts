import { CUSTOMIZABLE_SHOE_SLUG, customizeUrl } from "@/lib/catalog/purchase";

export const siteConfig = {
  name: "Velcraft",
  tagline: "Bespoke luxury footwear",
  description:
    "Design footwear that's made to match your style. Customize colors, premium fabrics, buckles, soles, and sizes in our interactive 3D designer.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  logo: {
    src: "/images/logo/velcraft-logo.png",
    alt: "Velcraft Luxury Shoes",
    width: 868,
    height: 662,
  },
  contact: {
    email: "support@velcraft.com",
    phone: "+92 300 0000000",
  },
  links: {
    collection: "/collection",
    about: "/about",
    customize: customizeUrl(),
    contact: "/contact",
    privacy: "/privacy",
    terms: "/terms",
    cart: "/cart",
    wishlist: "/wishlist",
    login: "/login",
    register: "/register",
    account: "/account/orders",
    checkout: "/checkout",
    admin: "/admin/dashboard",
  },
} as const;

export const navigation = [
  { label: "Home", href: "/" },
  { label: "Collection", href: "/collection" },
  { label: "About", href: "/about" },
  { label: "Atelier", href: customizeUrl() },
  { label: "Contact", href: "/contact" },
] as const;

export const accountNavigation = [
  { label: "Orders", href: "/account/orders" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Cart", href: "/cart" },
] as const;
