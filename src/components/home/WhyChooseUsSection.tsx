"use client";

import { motion } from "framer-motion";
import type { WhyChooseItem } from "@/types/api";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionShell } from "@/components/ui/SectionShell";
import { Button } from "@/components/ui/Button";
import { customizeUrl } from "@/lib/catalog/purchase";
import { staggerContainer, staggerItem } from "@/lib/motion";

const iconLabels: Record<string, string> = {
  gem: "Materials",
  cube: "3D Atelier",
  shield: "Assurance",
};

interface WhyChooseUsSectionProps {
  items: WhyChooseItem[];
}

export function WhyChooseUsSection({ items }: WhyChooseUsSectionProps) {
  return (
    <SectionShell tone="default" containerClassName="space-y-14">
      <SectionHeading
        eyebrow="Why Velcraft"
        title="The intimacy of a private atelier, refined for the digital age"
        description="Every silhouette is designed for bespoke expression — from material selection to signature hardware, finished with artisan care."
        align="center"
      />

      <motion.div
        variants={staggerContainer(0.08, 0.05)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid gap-6 md:grid-cols-3"
      >
        {items.map((item, index) => (
          <motion.div
            key={item.title}
            variants={staggerItem}
            className="glass-panel glass-panel-hover flex h-full flex-col rounded-[1.75rem] p-8"
          >
            <p className="text-xs uppercase tracking-[0.35em] text-accent">
              {iconLabels[item.icon ?? ""] ?? "Atelier"}
            </p>
            <p className="mt-3 font-display text-5xl text-white/10">{String(index + 1).padStart(2, "0")}</p>
            <h3 className="mt-4 font-display text-2xl text-white md:text-3xl">{item.title}</h3>
            <p className="mt-4 flex-1 text-sm leading-7 text-stone-400 md:text-base md:leading-8">
              {item.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <div className="flex justify-center pt-2">
        <Button href={customizeUrl()} size="lg">
          Start Customizing
        </Button>
      </div>
    </SectionShell>
  );
}
