"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SectionShell } from "@/components/ui/SectionShell";
import { Button } from "@/components/ui/Button";
import { customizeUrl } from "@/lib/catalog/purchase";
import { homeContent } from "@/lib/content/velcraft";
import { staggerContainer, staggerItem } from "@/lib/motion";

export function AtelierShowcaseSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const { craftedStyle } = homeContent;

  return (
    <SectionShell ref={ref} tone="default" containerClassName="relative">
      <motion.div
        style={{ y }}
        className="pointer-events-none absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
      />

      <motion.div
        variants={staggerContainer(0.1, 0.05)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="relative overflow-hidden rounded-[2.5rem] border border-accent/20 bg-[linear-gradient(135deg,rgba(201,169,98,0.14),rgba(12,10,9,0.95)_50%)] p-8 md:p-12"
      >
        <div className="absolute inset-0 hero-grid-pattern opacity-20" />
        <div className="absolute inset-x-0 top-0 gold-divider" />

        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <motion.p variants={staggerItem} className="text-xs uppercase tracking-[0.35em] text-accent">
              {craftedStyle.eyebrow}
            </motion.p>
            <motion.h2
              variants={staggerItem}
              className="font-display text-4xl leading-tight text-white md:text-5xl"
            >
              {craftedStyle.title}
            </motion.h2>
            <motion.p variants={staggerItem} className="max-w-xl text-base leading-8 text-stone-400">
              {craftedStyle.description}
            </motion.p>

            <motion.div variants={staggerItem} className="pt-2">
              <Button href={customizeUrl()} size="lg">
                {craftedStyle.ctaLabel}
              </Button>
            </motion.div>
          </div>

          <motion.div variants={staggerItem} className="glass-panel rounded-[2rem] p-8">
            <p className="text-xs uppercase tracking-[0.35em] text-accent">{craftedStyle.whyCustomersLoveUs}</p>
            <ul className="mt-6 space-y-4">
              {craftedStyle.features.map((feature, index) => (
                <li key={feature} className="flex items-start gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
                  <span className="font-display text-2xl text-accent/70">{String(index + 1).padStart(2, "0")}</span>
                  <p className="pt-1 text-sm leading-7 text-stone-300 md:text-base">{feature}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.div>
    </SectionShell>
  );
}
