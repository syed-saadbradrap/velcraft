import type { ShoeDetail } from "@/types/api";
import type { CustomizationConfig, ShoeType } from "@/types/customization";
import { normalizeImageUrl } from "@/lib/media";

export { normalizeImageUrl };

const modelBase = "/models";

import { CUSTOMIZABLE_SHOE_SLUG } from "@/lib/catalog/purchase";

/** Enabled for user-provided external GLB preview (see assets/blender/external/). */
export const PRODUCTION_GLB_APPROVED = true;

const importedModelSlugs = new Set<string>(
  PRODUCTION_GLB_APPROVED ? [CUSTOMIZABLE_SHOE_SLUG] : [],
);

export function usesImportedFullModel(slug: string) {
  return importedModelSlugs.has(slug);
}

/** Short, storefront-friendly material labels. */
export function materialDisplayName(material: {
  name?: string | null;
  slug?: string | null;
}) {
  const slug = material.slug?.trim().toLowerCase() ?? "";
  if (slug === "synthetic-leather" || slug.includes("synthetic")) {
    return "Synthetic";
  }
  if (slug === "suede" || slug.includes("suede")) {
    return "Suede";
  }

  const named = material.name?.trim() ?? "";
  if (/synthetic\s*leather/i.test(named)) {
    return "Synthetic";
  }
  return named || "Material";
}

/** Keep sole swatch labels readable even when API name is blank. */
export function soleColorDisplayName(sole: {
  name?: string | null;
  slug?: string | null;
  hex_code?: string | null;
}) {
  const named = sole.name?.trim();
  if (named) return named;

  const slug = sole.slug?.trim().replace(/[-_]+/g, " ");
  if (slug) {
    return slug.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  const hex = (sole.hex_code ?? "").toLowerCase();
  if (["#000", "#000000", "#111", "#111111", "#1a1a1a", "#0a0a0a"].includes(hex)) {
    return "Black";
  }
  if (["#fff", "#ffffff", "#f5f5f5", "#fafafa", "#f8f8f8"].includes(hex)) {
    return "White";
  }

  return sole.hex_code?.toUpperCase() || "Sole";
}

const fallbackModelsBySlug: Record<string, CustomizationConfig["models"]> = {
  "studio-loafer": {
    body: `${modelBase}/shoes/studio-loafer/shoe.glb`,
    sole: `${modelBase}/shoes/studio-loafer/shoe.glb`,
    logo: `${modelBase}/shoes/studio-loafer/shoe.glb`,
    inner: `${modelBase}/shoes/studio-loafer/shoe.glb`,
    default_buckle: `${modelBase}/buckles/buckle_01.glb`,
  },
  "ivory-gold-bit-mule": {
    body: `${modelBase}/shoes/ivory-gold-bit-mule/body.glb`,
    upper: `${modelBase}/shoes/ivory-gold-bit-mule/upper.glb`,
    sole: `${modelBase}/shoes/ivory-gold-bit-mule/sole.glb`,
    logo: `${modelBase}/shoes/ivory-gold-bit-mule/logo.glb`,
    inner: `${modelBase}/shoes/ivory-gold-bit-mule/inner.glb`,
    default_buckle: `${modelBase}/buckles/buckle_01.glb`,
  },
  "noir-minimal-mule": {
    body: `${modelBase}/shoes/noir-minimal-mule/body.glb`,
    sole: `${modelBase}/shoes/noir-minimal-mule/sole.glb`,
    logo: `${modelBase}/shoes/noir-minimal-mule/logo.glb`,
    inner: `${modelBase}/shoes/noir-minimal-mule/inner.glb`,
    default_buckle: `${modelBase}/buckles/minimal-bar.glb`,
  },
  "camel-suede-mule": {
    body: `${modelBase}/shoes/camel-suede-mule/body.glb`,
    sole: `${modelBase}/shoes/camel-suede-mule/sole.glb`,
    logo: `${modelBase}/shoes/camel-suede-mule/logo.glb`,
    inner: `${modelBase}/shoes/camel-suede-mule/inner.glb`,
    default_buckle: `${modelBase}/buckles/minimal-bar.glb`,
  },
  "espresso-horsebit-mule": {
    body: `${modelBase}/shoes/espresso-horsebit-mule/body.glb`,
    sole: `${modelBase}/shoes/espresso-horsebit-mule/sole.glb`,
    logo: `${modelBase}/shoes/espresso-horsebit-mule/logo.glb`,
    inner: `${modelBase}/shoes/espresso-horsebit-mule/inner.glb`,
    default_buckle: `${modelBase}/buckles/heritage-square.glb`,
  },
};

const buckleModelsBySlug: Record<string, string> = {
  "classic-oval": `${modelBase}/buckles/buckle_04.glb`,
  "heritage-square": `${modelBase}/buckles/buckle_03.glb`,
  "minimal-bar": `${modelBase}/buckles/buckle_02.glb`,
  "buckle-01": `${modelBase}/buckles/buckle_01.glb`,
  "buckle-02": `${modelBase}/buckles/buckle_02.glb`,
  "buckle-03": `${modelBase}/buckles/buckle_03.glb`,
  "buckle-04": `${modelBase}/buckles/buckle_04.glb`,
  "buckle-05": `${modelBase}/buckles/buckle_05.glb`,
  "buckle-06": `${modelBase}/buckles/buckle_06.glb`,
  "buckle-07": `${modelBase}/buckles/buckle_07.glb`,
  "buckle-08": `${modelBase}/buckles/buckle_08.glb`,
  "buckle-09": `${modelBase}/buckles/buckle_09.glb`,
  "buckle-10": `${modelBase}/buckles/buckle_10.glb`,
};

const legacyBuckleAliases: Record<string, string> = {
  "classic-oval.glb": `${modelBase}/buckles/buckle_04.glb`,
  "heritage-square.glb": `${modelBase}/buckles/buckle_03.glb`,
  "minimal-bar.glb": `${modelBase}/buckles/buckle_02.glb`,
};

function resolveLegacyBuckleUrl(candidate: string): string {
  const fileName = candidate.split("/").pop()?.toLowerCase() ?? "";
  return legacyBuckleAliases[fileName] ?? candidate;
}

export function normalizeModelUrl(url?: string | null, fallback?: string | null): string {
  const candidate = url && url.length > 0 ? url : fallback;
  if (!candidate) {
    return "";
  }

  if (candidate.startsWith("/models/")) {
    return resolveLegacyBuckleUrl(candidate);
  }

  const storagePattern = /\/storage\/models\/(.+\.glb)$/i;
  const relativeMatch = candidate.match(storagePattern);
  if (relativeMatch) {
    return resolveLegacyBuckleUrl(`${modelBase}/${relativeMatch[1]}`);
  }

  try {
    const parsed = new URL(candidate, "http://localhost");
    const absoluteMatch = parsed.pathname.match(storagePattern);
    if (absoluteMatch) {
      return resolveLegacyBuckleUrl(`${modelBase}/${absoluteMatch[1]}`);
    }
  } catch {
    return resolveLegacyBuckleUrl(candidate);
  }

  return resolveLegacyBuckleUrl(candidate);
}

const STUDIO_MATERIAL_SLUGS = new Set(["suede", "synthetic-leather"]);

const COLOR_DISPLAY_NAMES: Record<string, string> = {
  Black: "Onyx",
  "Charcoal Black": "Raven",
  "Charcoal Grey": "Cinder",
  Coral: "Terracotta",
  "Dark Brown": "Espresso",
  "Dark Grey": "Graphite",
  Grey: "Greige",
  "Light Brown": "Chestnut",
  Mauve: "Mink",
  "Navy Blue": "Midnight",
};

const NO_BUCKLE = {
  id: 0,
  name: "No Buckle",
  slug: "no-buckle",
  model_url: "",
  thumbnail_url: "",
  image_url: "",
  price_modifier: 0,
};

export function isNoBuckle(slug?: string | null, id?: number | null) {
  return slug === "no-buckle" || id === 0;
}

export function buildCustomizationConfig(shoe: ShoeDetail): CustomizationConfig {
  const fallbackModels =
    fallbackModelsBySlug[shoe.slug] ?? fallbackModelsBySlug["ivory-gold-bit-mule"];
  const models = {
    body: normalizeModelUrl(shoe.models?.body, fallbackModels.body),
    upper: normalizeModelUrl(shoe.models?.upper, fallbackModels.upper),
    sole: normalizeModelUrl(shoe.models?.sole, fallbackModels.sole),
    logo: normalizeModelUrl(shoe.models?.logo, fallbackModels.logo),
    inner: normalizeModelUrl(shoe.models?.inner, fallbackModels.inner),
    default_buckle: normalizeModelUrl(shoe.models?.default_buckle, fallbackModels.default_buckle),
  };

  const isStudio = shoe.slug === CUSTOMIZABLE_SHOE_SLUG;

  let materials = shoe.materials ?? [];
  if (isStudio) {
    materials = materials
      .filter((material) => STUDIO_MATERIAL_SLUGS.has(material.slug))
      .map((material) => ({ ...material, price_modifier: 0 }));
    if (materials.length === 0) {
      materials = [
        { id: 1, name: "Suede", slug: "suede", price_modifier: 0 },
        { id: 2, name: "Synthetic", slug: "synthetic-leather", price_modifier: 0 },
      ];
    }
  }
  materials = materials.map((material) => ({
    ...material,
    name: materialDisplayName(material),
  }));

  const colors = (shoe.colors ?? []).map((color) => ({
    ...color,
    name: COLOR_DISPLAY_NAMES[color.name] ?? color.name,
  }));

  const buckles = (shoe.buckles ?? [])
    .filter(
      (buckle) =>
        buckle.slug !== "buckle-10" &&
        buckle.slug !== "studio-emblem" &&
        buckle.name !== "Studio Emblem",
    )
    .map((buckle) => {
      const slugMatch = buckle.slug?.match(/buckle-?(\d+)/i);
      const index = slugMatch ? Number(slugMatch[1]) : null;
      const imageFallback =
        index && index >= 1 && index <= 10
          ? `/images/buckles/buckle_${String(index).padStart(2, "0")}.png`
          : null;
      const isNone = isNoBuckle(buckle.slug, buckle.id);

      return {
        ...buckle,
        price_modifier: 0,
        model_url: isNone
          ? ""
          : normalizeModelUrl(
              buckle.model_url,
              buckleModelsBySlug[buckle.slug] ?? models.default_buckle,
            ),
        thumbnail_url: isNone
          ? ""
          : normalizeImageUrl(buckle.thumbnail_url ?? buckle.image_url, imageFallback),
        image_url: isNone
          ? ""
          : normalizeImageUrl(buckle.image_url ?? buckle.thumbnail_url, imageFallback),
      };
    });

  if (!buckles.some((buckle) => isNoBuckle(buckle.slug, buckle.id))) {
    buckles.unshift({ ...NO_BUCKLE });
  }

  return {
    shoeId: shoe.id,
    // Studio display title can also be overridden via admin Settings → Customize page.
    shoeName: isStudio ? "Our Studio" : shoe.name,
    shoeSlug: shoe.slug,
    thumbnailUrl: normalizeImageUrl(shoe.thumbnail_url, `/images/shoes/${shoe.slug}.jpg`),
    basePrice: shoe.base_price,
    supportedTypes: (shoe.supported_types ?? ["backless", "covered"]) as ShoeType[],
    models,
    materials,
    colors,
    soleColors: (shoe.sole_colors ?? [
      { id: 1, name: "Black", slug: "black", hex_code: "#111111" },
      { id: 2, name: "White", slug: "white", hex_code: "#FFFFFF" },
    ]).map((sole) => ({
      ...sole,
      name: soleColorDisplayName(sole),
    })),
    buckles,
    sizes: shoe.sizes ?? [],
  };
}

export function getBuckleModelUrl(
  config: CustomizationConfig,
  buckleId: number | null,
): string {
  const selected = config.buckles.find((item) => item.id === buckleId);
  return selected?.model_url ?? config.models.default_buckle ?? "";
}
