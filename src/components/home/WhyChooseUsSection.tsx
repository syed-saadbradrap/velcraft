"use client";

import { motion } from "framer-motion";
import type { WhyChooseItem } from "@/types/api";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionShell } from "@/components/ui/SectionShell";
import { homeContent } from "@/lib/content/velcraft";
import { staggerContainer, staggerItem } from "@/lib/motion";

const iconLabels: Record<string, string> = {
  gem: "Fabrics",
  palette: "Colors",
  buckle: "Hardware",
  size: "Sizing",
  people: "Unisex",
  cube: "3D Atelier",
  craft: "Craft",
  shield: "Assurance",
};

interface WhyChooseUsSectionProps {
  items: WhyChooseItem[];
  eyebrow?: string;
  title?: string;
  description?: string;
}

function WhyChooseCard({ item, index }: { item: WhyChooseItem; index: number }) {
  return (
    <>
      <p className="text-xs uppercase tracking-[0.35em] text-accent">
        {iconLabels[item.icon ?? ""] ?? "Atelier"}
      </p>
      <p className="mt-3 font-display text-5xl text-white/10">{String(index + 1).padStart(2, "0")}</p>
      <h3 className="mt-4 font-display text-2xl text-white md:text-3xl">{item.title}</h3>
      <p className="mt-4 flex-1 text-sm leading-7 text-stone-400 md:text-base md:leading-8">{item.description}</p>
    </>
  );
}

export function WhyChooseUsSection({
  items,
  eyebrow = homeContent.whySettle.eyebrow,
  title = homeContent.whySettle.title,
  description = homeContent.whySettle.description,
}: WhyChooseUsSectionProps) {
  return (
    <SectionShell tone="default" containerClassName="space-y-14">
      <SectionHeading eyebrow={eyebrow} title={title} description={description} align="center" />

      <motion.div
        variants={staggerContainer(0.08, 0.05)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {items.map((item, index) => (
          <motion.div
            key={item.title}
            variants={staggerItem}
            className="glass-panel glass-panel-hover flex h-full flex-col rounded-[1.75rem] p-8"
          >
            <WhyChooseCard item={item} index={index} />
          </motion.div>
        ))}
      </motion.div>
    </SectionShell>
  );
}
