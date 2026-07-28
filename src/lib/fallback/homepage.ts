import type { HomepageData } from "@/types/api";
import { fallbackShoes } from "@/lib/fallback/catalog";
import { homeContent } from "@/lib/content/velcraft";

export const fallbackHomepageData: HomepageData = {
  brand: {
    name: "Velcraft",
    tagline: homeContent.hero.title,
  },
  hero: [
    {
      title: homeContent.hero.title,
      description: homeContent.hero.description,
      image_url: "/images/hero/main.jpg",
      cta_label: homeContent.hero.ctaLabel,
      cta_url: homeContent.hero.ctaUrl,
    },
  ],
  featured_shoes: fallbackShoes,
  process_steps: [],
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
