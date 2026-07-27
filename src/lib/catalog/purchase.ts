import type { ShoeDetail } from "@/types/api";
import type { ShoeType } from "@/types/customization";
import type { ApiCustomization } from "@/types/commerce";

export const CUSTOMIZABLE_SHOE_SLUG = "ivory-gold-bit-mule";

export function isCustomizableShoe(slug: string) {
  return slug === CUSTOMIZABLE_SHOE_SLUG;
}

export function customizeUrl(slug?: string) {
  return `/customize/${CUSTOMIZABLE_SHOE_SLUG}`;
}

export function buildDefaultCustomization(shoe: ShoeDetail): ApiCustomization {
  const womenSize = shoe.sizes?.find((size) => size.gender === "women");
  const defaultSize = womenSize ?? shoe.sizes?.[0];

  return {
    material_id: shoe.materials?.[0]?.id ?? 1,
    color_hex: shoe.colors?.[0]?.hex_code ?? "#F8F4EC",
    sole_color_hex: shoe.sole_colors?.[0]?.hex_code ?? "#111111",
    buckle_id: shoe.buckles?.[0]?.id ?? 1,
    shoe_type: (shoe.supported_types?.[0] as ShoeType) ?? "backless",
    size_id: defaultSize?.id ?? 1,
  };
}
