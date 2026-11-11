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
      <div className="grid gap-6 pb-[calc(10rem+env(safe-area-inset-bottom))] sm:gap-8 lg:grid-cols-[minmax(300px,400px)_minmax(0,1fr)] lg:items-start lg:pb-0">
        <CustomizationPanel />
        <div className="h-[min(68svh,520px)] sm:h-[min(72svh,600px)] lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:max-h-[760px]">
          <ShoeViewer />
        </div>
      </div>
      <CustomizeMobileBar />
    </CustomizationProvider>
  );
}
