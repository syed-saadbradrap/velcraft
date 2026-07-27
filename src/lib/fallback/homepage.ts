import type { HomepageData } from "@/types/api";
import { fallbackShoes } from "@/lib/fallback/catalog";

export const fallbackHomepageData: HomepageData = {
  brand: {
    name: "Velcraft",
    tagline: "Handcrafted mules. Designed by you.",
  },
  hero: [
    {
      title: "Luxury Mules, Made Yours",
      subtitle: "Velcraft Atelier",
      description:
        "Premium suede and velvet backless silhouettes with signature hardware — shop the collection or enter the atelier to configure your signature mule in real time.",
      image_url: "/images/hero/main.jpg",
      cta_label: "Open Atelier",
      cta_url: "/customize/ivory-gold-bit-mule",
    },
  ],
  featured_shoes: fallbackShoes,
  process_steps: [
    {
      title: "Choose Your Silhouette",
      description:
        "Select from our signature mule collection photographed and curated for bespoke customization.",
      icon: "shoe",
    },
    {
      title: "Configure Every Detail",
      description:
        "Material, color, buckle, sole, and size — all rendered instantly in 3D.",
      icon: "palette",
    },
    {
      title: "Crafted & Delivered",
      description:
        "Your design enters production with artisan oversight and tracked delivery.",
      icon: "truck",
    },
  ],
  why_choose_us: [
    {
      title: "Artisan Materials",
      description:
        "Premium suede, velvet, and leather finishes sourced for durability and feel.",
      icon: "gem",
    },
    {
      title: "Real-Time 3D Preview",
      description:
        "Every customization updates instantly in a performance-optimized viewer.",
      icon: "cube",
    },
    {
      title: "White-Glove Fulfillment",
      description:
        "Tracked production, flexible payments, and concierge support from design to delivery.",
      icon: "shield",
    },
  ],
  testimonials: [
    {
      customer_name: "Amelia Hart",
      customer_title: "Creative Director",
      content:
        "The ivory gold bit mule looks exactly like the photos — customization feels like a private atelier.",
      rating: 5,
    },
    {
      customer_name: "Julian Mercer",
      customer_title: "Founder, Mercer Studio",
      content:
        "We configured a full team collection in one session. The quality and consistency are outstanding.",
      rating: 5,
    },
    {
      customer_name: "Sofia Laurent",
      customer_title: "Fashion Editor",
      content:
        "Velcraft balances luxury craftsmanship with a digital experience that still feels personal and refined.",
      rating: 5,
    },
    {
      customer_name: "Marcus Chen",
      customer_title: "Brand Consultant",
      content:
        "From material selection to delivery, the process was seamless. The finished pair exceeded our expectations.",
      rating: 5,
    },
  ],
  newsletter: {
    title: "Join the Atelier List",
    description:
      "Receive early access to new collections and bespoke customization drops.",
  },
};
