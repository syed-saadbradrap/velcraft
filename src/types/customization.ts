export type ShoeType = "backless" | "covered";
export type ShoeGender = "women" | "men";

export interface CustomizationSelection {
  materialId: number | null;
  colorHex: string;
  soleColorHex: string;
  buckleId: number | null;
  shoeType: ShoeType;
  gender: ShoeGender;
  sizeId: number | null;
}

export interface CustomizationOptionMaterial {
  id: number;
  name: string;
  slug: string;
  texture_url?: string | null;
  price_modifier: number;
}

export interface CustomizationOptionColor {
  id: number;
  name: string;
  hex_code: string;
  swatch_path?: string | null;
  swatch_url?: string | null;
}

export interface CustomizationOptionBuckle {
  id: number;
  name: string;
  slug: string;
  model_url?: string | null;
  price_modifier: number;
}

export interface CustomizationOptionSoleColor {
  id: number;
  name: string;
  slug: string;
  hex_code: string;
}

export interface CustomizationOptionSize {
  id: number;
  gender: string;
  label: string;
  value: number;
}

export interface ShoeModelPaths {
  body?: string | null;
  upper?: string | null;
  sole?: string | null;
  logo?: string | null;
  inner?: string | null;
  default_buckle?: string | null;
}

export interface CustomizationConfig {
  shoeId: number;
  shoeName: string;
  shoeSlug: string;
  thumbnailUrl?: string | null;
  basePrice: number;
  supportedTypes: ShoeType[];
  models: ShoeModelPaths;
  materials: CustomizationOptionMaterial[];
  colors: CustomizationOptionColor[];
  soleColors: CustomizationOptionSoleColor[];
  buckles: CustomizationOptionBuckle[];
  sizes: CustomizationOptionSize[];
}
