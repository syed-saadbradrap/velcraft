import type { CollectionSummary, PaginatedShoes, ShoeDetail, ShoeSummary } from "@/types/api";
import { catalogProducts, catalogThumbnailPath } from "@/lib/catalog/products";
import { getCatalogProduct } from "@/lib/catalog/product-display";

export const fallbackCollections: CollectionSummary[] = [
  {
    id: 2,
    name: "Men",
    slug: "men",
    description: "Curated boots, mules, and backless styles for men.",
    image_url: "/images/collections/men.jpg",
    shoes_count: catalogProducts.length,
  },
  {
    id: 3,
    name: "Women",
    slug: "women",
    description: "Elegant silhouettes for women.",
    image_url: "/images/collections/women.jpg",
    shoes_count: 0,
  },
  {
    id: 1,
    name: "Impression",
    slug: "signature",
    description: "Refined backless silhouettes in premium suede and velvet finishes.",
    image_url: "/images/collections/signature.jpg",
    shoes_count: 0,
  },
];

export const fallbackShoes: ShoeSummary[] = catalogProducts.map((product, index) => ({
  id: index + 1,
  name: product.name,
  slug: product.slug,
  description: product.description,
  base_price: product.base_price,
  thumbnail_url: catalogThumbnailPath(product.slug),
  is_featured: product.is_featured,
  collection: { id: 2, name: "Men", slug: "men" },
}));

export const fallbackPaginatedShoes: PaginatedShoes = {
  items: fallbackShoes,
  pagination: {
    current_page: 1,
    last_page: 2,
    per_page: 12,
    total: fallbackShoes.length,
  },
};

const backlessSlugs = new Set(
  catalogProducts.filter((p) => p.supported_types.length === 1 && p.supported_types[0] === "backless").map((p) => p.slug),
);

const dualTypeSlugs = new Set(
  catalogProducts.filter((p) => p.supported_types.includes("backless") && p.supported_types.includes("covered")).map((p) => p.slug),
);

function getModelSlug(slug: string) {
  if (slug === "ivory-gold-bit-mule") return "ivory-gold-bit-mule";
  return backlessSlugs.has(slug) ? "noir-minimal-mule" : "ivory-gold-bit-mule";
}

export function getFallbackShoeDetail(slug: string): ShoeDetail | null {
  if (slug === "ivory-gold-bit-mule") {
    return {
      id: 99,
      name: "Ivory Gold Bit Mule",
      slug: "ivory-gold-bit-mule",
      description: "Signature customizable mule — configure fabric, color, buckle, and sole in 3D.",
      base_price: 3999,
      thumbnail_url: "/images/shoes/ivory-gold-bit-mule.webp",
      is_featured: false,
      collection: { id: 2, name: "Men", slug: "men" },
      supported_types: ["backless", "covered"],
      models: {
        body: "/models/shoes/ivory-gold-bit-mule/body.glb",
        upper: "/models/shoes/ivory-gold-bit-mule/upper.glb",
        sole: "/models/shoes/ivory-gold-bit-mule/sole.glb",
        logo: "/models/shoes/ivory-gold-bit-mule/logo.glb",
        inner: "/models/shoes/ivory-gold-bit-mule/inner.glb",
        default_buckle: "/models/buckles/classic-oval.glb",
      },
      materials: [
        { id: 1, name: "Suede", slug: "suede", price_modifier: 0 },
        { id: 2, name: "Synthetic Leather", slug: "synthetic-leather", price_modifier: 0 },
      ],
      colors: [
        { id: 1, name: "Ivory", hex_code: "#F8F4EC" },
        { id: 2, name: "Noir", hex_code: "#111111" },
        { id: 3, name: "Burgundy", hex_code: "#6B1D2A" },
        { id: 4, name: "Camel", hex_code: "#C19A6B" },
        { id: 5, name: "Espresso", hex_code: "#3D2B1F" },
        { id: 6, name: "Navy", hex_code: "#1B2A41" },
      ],
      sole_colors: [
        { id: 1, name: "Black", slug: "black", hex_code: "#111111" },
        { id: 2, name: "White", slug: "white", hex_code: "#FFFFFF" },
      ],
      buckles: [
        { id: 1, name: "Classic Oval", slug: "classic-oval", model_url: "/models/buckles/classic-oval.glb", price_modifier: 0 },
        { id: 2, name: "Heritage Square", slug: "heritage-square", model_url: "/models/buckles/heritage-square.glb", price_modifier: 100 },
        { id: 3, name: "Minimal Bar", slug: "minimal-bar", model_url: "/models/buckles/minimal-bar.glb", price_modifier: 200 },
      ],
      sizes: [
        { id: 1, gender: "women", label: "35", value: 35 },
        { id: 2, gender: "women", label: "36", value: 36 },
        { id: 3, gender: "women", label: "37", value: 37 },
        { id: 4, gender: "women", label: "38", value: 38 },
        { id: 5, gender: "men", label: "40", value: 40 },
        { id: 6, gender: "men", label: "41", value: 41 },
        { id: 7, gender: "men", label: "42", value: 42 },
        { id: 8, gender: "men", label: "43", value: 43 },
        { id: 9, gender: "men", label: "44", value: 44 },
        { id: 10, gender: "men", label: "45", value: 45 },
      ],
    };
  }

  const product = catalogProducts.find((item) => item.slug === slug);
  const shoe = fallbackShoes.find((item) => item.slug === slug);
  if (!product || !shoe) return null;

  const catalogProduct = getCatalogProduct(slug);
  const modelSlug = getModelSlug(slug);
  let supportedTypes: ("backless" | "covered")[];
  if (dualTypeSlugs.has(slug)) {
    supportedTypes = ["backless", "covered"];
  } else if (backlessSlugs.has(slug)) {
    supportedTypes = ["backless"];
  } else {
    supportedTypes = ["covered"];
  }

  return {
    ...shoe,
    supported_types: supportedTypes,
    models: {
      body: `/models/shoes/${modelSlug}/body.glb`,
      upper: `/models/shoes/${modelSlug}/upper.glb`,
      sole: `/models/shoes/${modelSlug}/sole.glb`,
      logo: `/models/shoes/${modelSlug}/logo.glb`,
      inner: `/models/shoes/${modelSlug}/inner.glb`,
      default_buckle: `/models/buckles/${slug === "brown-diff-buckle" ? "heritage-square" : "classic-oval"}.glb`,
    },
    materials: [
      {
        id: 1,
        name: catalogProduct?.material ?? "Suede",
        slug: catalogProduct?.material.toLowerCase().replace(/\s+/g, "-") ?? "suede",
        price_modifier: 0,
      },
    ],
    colors: [
      {
        id: 1,
        name: catalogProduct?.color ?? product.color,
        hex_code: catalogProduct?.color_hex ?? "#111111",
      },
    ],
    sole_colors: [
      { id: 1, name: "Black", slug: "black", hex_code: "#111111" },
      { id: 2, name: "White", slug: "white", hex_code: "#FFFFFF" },
    ],
    buckles: [
      { id: 1, name: "Classic Oval", slug: "classic-oval", model_url: "/models/buckles/classic-oval.glb", price_modifier: 0 },
      { id: 2, name: "Heritage Square", slug: "heritage-square", model_url: "/models/buckles/heritage-square.glb", price_modifier: 100 },
      { id: 3, name: "Minimal Bar", slug: "minimal-bar", model_url: "/models/buckles/minimal-bar.glb", price_modifier: 200 },
    ],
    sizes: [
      { id: 5, gender: "men", label: "40", value: 40 },
      { id: 6, gender: "men", label: "41", value: 41 },
      { id: 7, gender: "men", label: "42", value: 42 },
      { id: 8, gender: "men", label: "43", value: 43 },
      { id: 9, gender: "men", label: "44", value: 44 },
      { id: 10, gender: "men", label: "45", value: 45 },
    ],
  };
}
