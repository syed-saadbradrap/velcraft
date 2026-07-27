import { siteConfig } from "@/config/site";
import { fallbackHomepageData } from "@/lib/fallback/homepage";

export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: fallbackHomepageData.brand.name,
    description: siteConfig.description,
    url: siteConfig.url,
    priceRange: "$$$",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
