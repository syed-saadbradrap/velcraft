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
      <div className="grid gap-6 pb-24 sm:gap-8 lg:grid-cols-[420px_minmax(0,1fr)] lg:items-start lg:pb-0">
        <CustomizationPanel />
        <div className="h-[min(72svh,560px)] sm:h-[min(78svh,640px)] lg:sticky lg:top-0 lg:h-[100vh]">
          <ShoeViewer />
        </div>
      </div>
      <CustomizeMobileBar />
    </CustomizationProvider>
  );
}
