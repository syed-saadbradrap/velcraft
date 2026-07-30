import type { CollectionSummary, PaginatedShoes, ShoeDetail, ShoeSummary } from "@/types/api";

export const fallbackCollections: CollectionSummary[] = [
  {
    id: 1,
    name: "Signature Mules",
    slug: "signature",
    description: "Refined backless silhouettes in premium suede and velvet finishes.",
    image_url: "/images/collections/signature.jpg",
    shoes_count: 3,
  },
  {
    id: 2,
    name: "Heritage Classics",
    slug: "heritage",
    description: "Horsebit details and rich leather tones for elevated everyday wear.",
    image_url: "/images/collections/evening.jpg",
    shoes_count: 1,
  },
];

export const fallbackShoes: ShoeSummary[] = [
  {
    id: 1,
    name: "Ivory Gold Bit Mule",
    slug: "ivory-gold-bit-mule",
    description:
      "Cream velvet upper with signature gold horsebit hardware and moc-toe stitching.",
    base_price: 82900,
    thumbnail_url: "/images/shoes/ivory-gold-bit-mule.jpg",
    is_featured: true,
    collection: { id: 1, name: "Signature Mules", slug: "signature" },
  },
  {
    id: 2,
    name: "Noir Minimal Mule",
    slug: "noir-minimal-mule",
    description:
      "Deep black suede slip-on with clean lines and a softly padded insole.",
    base_price: 74900,
    thumbnail_url: "/images/shoes/noir-minimal-mule.jpg",
    is_featured: true,
    collection: { id: 1, name: "Signature Mules", slug: "signature" },
  },
  {
    id: 3,
    name: "Camel Suede Mule",
    slug: "camel-suede-mule",
    description:
      "Warm camel suede with contrast maroon footbed and a slim black outsole.",
    base_price: 77900,
    thumbnail_url: "/images/shoes/camel-suede-mule.jpg",
    is_featured: true,
    collection: { id: 1, name: "Signature Mules", slug: "signature" },
  },
  {
    id: 4,
    name: "Espresso Horsebit Mule",
    slug: "espresso-horsebit-mule",
    description:
      "Chocolate leather base with tobacco suede vamp and gunmetal horsebit ornament.",
    base_price: 89900,
    thumbnail_url: "/images/shoes/espresso-horsebit-mule.jpg",
    is_featured: true,
    collection: { id: 2, name: "Heritage Classics", slug: "heritage" },
  },
];

export const fallbackPaginatedShoes: PaginatedShoes = {
  items: fallbackShoes,
  pagination: {
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: fallbackShoes.length,
  },
};

const modelGlbs: Record<string, string> = {
  "ivory-gold-bit-mule": "ivory-gold-bit-mule",
  "noir-minimal-mule": "noir-minimal-mule",
  "camel-suede-mule": "camel-suede-mule",
  "espresso-horsebit-mule": "espresso-horsebit-mule",
};

const defaultBuckle: Record<string, string> = {
  "ivory-gold-bit-mule": "classic-oval",
  "noir-minimal-mule": "minimal-bar",
  "camel-suede-mule": "minimal-bar",
  "espresso-horsebit-mule": "heritage-square",
};

export function getFallbackShoeDetail(slug: string): ShoeDetail | null {
  const shoe = fallbackShoes.find((item) => item.slug === slug);
  if (!shoe) {
    return null;
  }

  const modelSlug = modelGlbs[shoe.slug] ?? "ivory-gold-bit-mule";
  const buckle = defaultBuckle[shoe.slug] ?? "classic-oval";

  return {
    ...shoe,
    supported_types: shoe.slug === "noir-minimal-mule" || shoe.slug === "camel-suede-mule"
      ? ["backless"]
      : ["backless", "covered"],
    models: {
      body: `/models/shoes/${modelSlug}/body.glb`,
      upper: `/models/shoes/${modelSlug}/upper.glb`,
      sole: `/models/shoes/${modelSlug}/sole.glb`,
      logo: `/models/shoes/${modelSlug}/logo.glb`,
      inner: `/models/shoes/${modelSlug}/inner.glb`,
      default_buckle: `/models/buckles/${buckle}.glb`,
    },
    materials: [
      { id: 1, name: "Suede", slug: "suede", price_modifier: 0 },
      { id: 2, name: "Synthetic Leather", slug: "synthetic-leather", price_modifier: 7000 },
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
      {
        id: 1,
        name: "Classic Oval",
        slug: "classic-oval",
        model_url: "/models/buckles/classic-oval.glb",
        price_modifier: 0,
      },
      {
        id: 2,
        name: "Heritage Square",
        slug: "heritage-square",
        model_url: "/models/buckles/heritage-square.glb",
        price_modifier: 2800,
      },
      {
        id: 3,
        name: "Minimal Bar",
        slug: "minimal-bar",
        model_url: "/models/buckles/minimal-bar.glb",
        price_modifier: 5600,
      },
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
