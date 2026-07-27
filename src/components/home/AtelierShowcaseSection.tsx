"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { SectionShell } from "@/components/ui/SectionShell";
import { Button } from "@/components/ui/Button";
import { customizeUrl } from "@/lib/catalog/purchase";
import { staggerContainer, staggerItem } from "@/lib/motion";

const features = [
  "Real-time 3D preview",
  "12+ material finishes",
  "Signature hardware",
  "Concierge sizing",
] as const;

const steps = [
  { step: "01", label: "Select silhouette", value: "Ivory Gold Bit Mule" },
  { step: "02", label: "Choose material", value: "Premium ivory suede" },
  { step: "03", label: "Configure hardware", value: "Gold horsebit buckle" },
  { step: "04", label: "Preview & order", value: "Live 3D atelier" },
] as const;

export function AtelierShowcaseSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

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
              The Atelier Experience
            </motion.p>
            <motion.h2
              variants={staggerItem}
              className="font-display text-4xl leading-tight text-white md:text-5xl"
            >
              Design your signature mule in <span className="luxury-gradient">real time</span>
            </motion.h2>
            <motion.p variants={staggerItem} className="max-w-xl text-base leading-8 text-stone-400">
              Step into our interactive studio — configure suede, hardware, sole color, and size with a live 3D preview
              before your pair enters production.
            </motion.p>

            <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3">
              {features.map((feature) => (
                <span
                  key={feature}
                  className="rounded-2xl border border-border bg-white/5 px-4 py-3 text-center text-[10px] uppercase tracking-[0.18em] text-stone-300"
                >
                  {feature}
                </span>
              ))}
            </motion.div>

            <motion.div variants={staggerItem} className="flex flex-wrap gap-4 pt-2">
              <Button href={customizeUrl()} size="lg">
                Enter Atelier Studio
              </Button>
              <Button href="/collection" variant="secondary" size="lg">
                Browse Collection
              </Button>
            </motion.div>
          </div>

          <motion.div variants={staggerItem} className="glass-panel rounded-[2rem] p-8">
            <div className="space-y-5">
              {steps.map((row) => (
                <div
                  key={row.step}
                  className="flex items-start gap-4 border-b border-border pb-5 last:border-0 last:pb-0"
                >
                  <span className="font-display text-2xl text-accent/70">{row.step}</span>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">{row.label}</p>
                    <p className="mt-1 font-display text-xl text-white">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </SectionShell>
  );
}
