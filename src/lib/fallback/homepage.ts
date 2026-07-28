import type { HomepageData } from "@/types/api";
import { fallbackShoes } from "@/lib/fallback/catalog";
import { homeContent } from "@/lib/content/velcraft";

export const fallbackHomepageData: HomepageData = {
  brand: {
    name: "Velcraft",
    tagline: "Your Shoes. Your Signature.",
  },
  hero: [
    {
      title: homeContent.hero.title,
      subtitle: homeContent.hero.subtitle,
      description: homeContent.hero.description,
      image_url: "/images/hero/main.jpg",
      cta_label: homeContent.hero.ctaLabel,
      cta_url: homeContent.hero.ctaUrl,
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
  why_choose_us: homeContent.whySettle.highlights.map((item) => ({
    title: item.title,
    description: item.description,
    icon: item.icon,
  })),
  testimonials: [...homeContent.testimonials.items],
  newsletter: {
    title: homeContent.finalCta.title,
    description: homeContent.finalCta.description,
  },
};
