"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { CustomizationConfig } from "@/types/customization";
import {
  CustomizeMobileControls,
  CustomizeMobileLanding,
  CustomizeMobileStepper,
  type MobileCustomizePhase,
} from "@/components/customize/CustomizeMobileFlow";
import { CustomizationProvider } from "@/context/CustomizationContext";
import { CustomizationPanel } from "@/components/customize/CustomizationPanel";
import { ViewerSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

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
  const [mobilePhase, setMobilePhase] = useState<MobileCustomizePhase>("landing");

  return (
    <CustomizationProvider config={config}>
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(300px,400px)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <div className="hidden lg:block">
          <CustomizationPanel />
        </div>

        {mobilePhase === "landing" ? (
          <div className="lg:hidden">
            <CustomizeMobileLanding onStart={() => setMobilePhase("customize")} />
          </div>
        ) : (
          <div className="lg:hidden">
            <CustomizeMobileStepper
              phase={mobilePhase}
              onBack={() =>
                setMobilePhase(mobilePhase === "review" ? "customize" : "landing")
              }
            />
          </div>
        )}

        <div
          className={cn(
            "overflow-hidden rounded-[1.5rem] border border-border lg:h-[calc(100vh-2rem)] lg:max-h-[780px] lg:rounded-[2rem]",
            mobilePhase === "landing"
              ? "hidden h-[min(52svh,420px)] lg:block"
              : "h-[min(52svh,420px)]",
          )}
        >
          <ShoeViewer />
        </div>

        {mobilePhase !== "landing" ? (
          <div className="lg:hidden">
            <CustomizeMobileControls
              phase={mobilePhase}
              onReview={() => setMobilePhase("review")}
            />
          </div>
        ) : null}
      </div>
    </CustomizationProvider>
  );
}
