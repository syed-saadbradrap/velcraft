"use client";

import dynamic from "next/dynamic";
import type { CustomizationConfig } from "@/types/customization";
import { CustomizeMobileBar } from "@/components/customize/CustomizeMobileBar";
import { CustomizationProvider } from "@/context/CustomizationContext";
import { CustomizationPanel } from "@/components/customize/CustomizationPanel";
import { ViewerSkeleton } from "@/components/ui/Skeleton";

const ShoeViewer = dynamic(
  () =>
    import("@/components/customize/viewer/ShoeViewer").then((module) => module.ShoeViewer),
  {
    ssr: false,
    loading: () => <ViewerSkeleton />,
  },
);

interface CustomizeStudioProps {
  config: CustomizationConfig;
}

export function CustomizeStudio({ config }: CustomizeStudioProps) {
  return (
    <CustomizationProvider config={config}>
      <div className="grid gap-8 pb-24 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start lg:pb-0">
        <CustomizationPanel />
        <div className="h-[100vh] lg:sticky lg:top-0">
          <ShoeViewer />
        </div>
      </div>
      <CustomizeMobileBar />
    </CustomizationProvider>
  );
}
