"use client";

import { ImportedShoeViewer } from "@/components/customize/viewer/ImportedShoeViewer";
import { ProceduralShoe } from "@/components/customize/viewer/ProceduralShoe";
import { useCustomization } from "@/context/CustomizationContext";
import { usesImportedFullModel } from "@/lib/customize/config-builder";

export function ShoeScene() {
  const { config } = useCustomization();

  if (usesImportedFullModel(config.shoeSlug)) {
    return <ImportedShoeViewer />;
  }

  return <ProceduralShoe />;
}
