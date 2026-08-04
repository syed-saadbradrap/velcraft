import { siteConfig } from "@/config/site";
import { catalogProducts } from "@/lib/catalog/products";

export interface ProductDisplayInfo {
  slug: string;
  name: string;
  description: string;
  base_price: number;
  collection: string;
  gender: string;
  style: string;
  color: string;
  color_hex: string;
  material: string;
  hardware: string;
  silhouette: string;
  sizing: string;
  delivery: string;
  highlights: string[];
}

const catalogSlugSet = new Set(catalogProducts.map((product) => product.slug));

export function isCatalogProduct(slug: string) {
  return catalogSlugSet.has(slug);
}

export function getCatalogProduct(slug: string) {
  return catalogProducts.find((product) => product.slug === slug) ?? null;
}

function formatSilhouette(supportedTypes: readonly string[]) {
  if (supportedTypes.length === 2) {
    return "Covered & Backless";
  }

  if (supportedTypes[0] === "backless") {
    return "Backless Mule";
  }

  if (supportedTypes[0] === "covered") {
    return "Covered Mule";
  }

  return "Signature Silhouette";
}

export function getProductDisplayInfo(
  slug: string,
  overrides?: Partial<Pick<ProductDisplayInfo, "name" | "description" | "base_price" | "collection">>,
): ProductDisplayInfo | null {
  const product = getCatalogProduct(slug);
  if (!product) {
    return null;
  }

  return {
    slug: product.slug,
    name: overrides?.name ?? product.name,
    description: overrides?.description ?? product.description,
    base_price: overrides?.base_price ?? product.base_price,
    collection: overrides?.collection ?? "Men",
    gender: "Men",
    style: product.style,
    color: product.color,
    color_hex: product.color_hex,
    material: product.material,
    hardware: product.hardware,
    silhouette: formatSilhouette(product.supported_types),
    sizing: product.sizing,
    delivery: siteConfig.deliveryTimeline,
    highlights: product.highlights,
  };
}
