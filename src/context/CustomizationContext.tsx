"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getBuckleModelUrl } from "@/lib/customize/config-builder";
import type {
  CustomizationConfig,
  CustomizationSelection,
  ShoeGender,
  ShoeType,
} from "@/types/customization";

interface CustomizationContextValue {
  config: CustomizationConfig;
  selection: CustomizationSelection;
  buckleModelUrl: string;
  totalPrice: number;
  setMaterial: (materialId: number) => void;
  setColor: (hex: string) => void;
  setSoleColor: (hex: string) => void;
  setBuckle: (buckleId: number) => void;
  setShoeType: (type: ShoeType) => void;
  setGender: (gender: ShoeGender) => void;
  setSize: (sizeId: number) => void;
}

const CustomizationContext = createContext<CustomizationContextValue | null>(null);

function getDefaultGender(config: CustomizationConfig): ShoeGender {
  if (config.sizes.some((size) => size.gender === "women")) {
    return "women";
  }

  return "men";
}

function getFirstSizeForGender(config: CustomizationConfig, gender: ShoeGender) {
  return config.sizes.find((size) => size.gender === gender) ?? null;
}

function createInitialSelection(config: CustomizationConfig): CustomizationSelection {
  const gender = getDefaultGender(config);
  const defaultSize = getFirstSizeForGender(config, gender);

  return {
    materialId: config.materials[0]?.id ?? null,
    colorHex: config.colors[0]?.hex_code ?? "#F8F4EC",
    soleColorHex: config.soleColors[0]?.hex_code ?? "#111111",
    buckleId: config.buckles[0]?.id ?? null,
    shoeType: config.supportedTypes[0] ?? "covered",
    gender,
    sizeId: defaultSize?.id ?? config.sizes[0]?.id ?? null,
  };
}

function calculatePrice(config: CustomizationConfig, selection: CustomizationSelection) {
  const material = config.materials.find((item) => item.id === selection.materialId);
  const buckle = config.buckles.find((item) => item.id === selection.buckleId);

  return config.basePrice + (material?.price_modifier ?? 0) + (buckle?.price_modifier ?? 0);
}

interface CustomizationProviderProps {
  config: CustomizationConfig;
  children: ReactNode;
}

export function CustomizationProvider({ config, children }: CustomizationProviderProps) {
  const [selection, setSelection] = useState<CustomizationSelection>(() =>
    createInitialSelection(config),
  );

  const value = useMemo<CustomizationContextValue>(() => ({
      config,
      selection,
      buckleModelUrl: getBuckleModelUrl(config, selection.buckleId),
      totalPrice: calculatePrice(config, selection),
      setMaterial: (materialId) => setSelection((current) => ({ ...current, materialId })),
      setColor: (colorHex) => setSelection((current) => ({ ...current, colorHex })),
      setSoleColor: (soleColorHex) =>
        setSelection((current) => ({ ...current, soleColorHex })),
      setBuckle: (buckleId) => setSelection((current) => ({ ...current, buckleId })),
      setShoeType: (shoeType) => setSelection((current) => ({ ...current, shoeType })),
      setGender: (gender) =>
        setSelection((current) => {
          const sizesForGender = config.sizes.filter((size) => size.gender === gender);
          const currentSizeValid = sizesForGender.some((size) => size.id === current.sizeId);

          return {
            ...current,
            gender,
            sizeId: currentSizeValid ? current.sizeId : sizesForGender[0]?.id ?? null,
          };
        }),
      setSize: (sizeId) => setSelection((current) => ({ ...current, sizeId })),
    }), [config, selection]);

  return (
    <CustomizationContext.Provider value={value}>{children}</CustomizationContext.Provider>
  );
}

export function useCustomization() {
  const context = useContext(CustomizationContext);

  if (!context) {
    throw new Error("useCustomization must be used within CustomizationProvider");
  }

  return context;
}

export function useSelectedMaterialSlug() {
  const { config, selection } = useCustomization();
  return config.materials.find((item) => item.id === selection.materialId)?.slug ?? "suede";
}

export function useSelectedMaterialTexture() {
  const { config, selection } = useCustomization();
  return config.materials.find((item) => item.id === selection.materialId)?.texture_url ?? null;
}
