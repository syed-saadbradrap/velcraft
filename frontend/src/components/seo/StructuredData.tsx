import { siteConfig } from "@/config/site";
import { fallbackHomepageData } from "@/lib/fallback/homepage";

export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: fallbackHomepageData.brand.name,
    description: siteConfig.description,
    url: siteConfig.url,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.contact.address,
      addressLocality: "Karachi",
      addressCountry: siteConfig.defaultCountry,
    },
    priceRange: "₨₨₨",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
