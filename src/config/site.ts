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
  currency: "PKR",
  currencyLocale: "en-PK",
  shippingFlat: 2500,
  defaultCountry: "PK",
  countryName: "Pakistan",
  contact: {
    email: "support@velcraftpk.com",
    phone: "+92 300 0000000",
    whatsapp: "+92 300 0000000",
    whatsappMessage: "Hi Velcraft, I would like to know more about your custom shoes.",
    hours: "Monday - Saturday, 12:00 PM - 10:00 PM (PKT)",
    address: "Dolmen Center, Tariq Road, Karachi, Pakistan",
  },
  payments: {
    cod: {
      label: "Cash on Delivery",
      description: "Pay in cash when your order arrives at your doorstep.",
    },
    bankTransfer: {
      label: "Bank Transfer",
      description: "Transfer the order total to our bank account and share payment proof by email.",
      bankName: "Meezan Bank",
      accountTitle: "Velcraft",
      accountNumber: "01234567890123",
      iban: "PK00MEZN0000123456789012",
    },
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
  { label: "About", href: "/about" },
  { label: "Collection", href: "/collection" },
  { label: "Atelier", href: customizeUrl() },
  { label: "Contact", href: "/contact" },
] as const;

export const accountNavigation = [
  { label: "Orders", href: "/account/orders" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Cart", href: "/cart" },
] as const;
