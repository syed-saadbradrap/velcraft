"use client";

import { motion } from "framer-motion";
import { SectionShell } from "@/components/ui/SectionShell";
import { Reveal } from "@/components/motion/Reveal";
import { staggerContainer, staggerItem } from "@/lib/motion";

const materials = [
  { name: "Ivory Suede", color: "#f5f0e8" },
  { name: "Noir Velvet", color: "#1a1816" },
  { name: "Camel Suede", color: "#c4a574" },
  { name: "Espresso Leather", color: "#3d2314" },
  { name: "Burgundy Lining", color: "#5c1a24" },
  { name: "Gold Hardware", color: "#c9a962" },
] as const;

export function CraftsmanshipSection() {
  return (
    <SectionShell tone="muted" containerClassName="space-y-12">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-accent">Materials & Finish</p>
        <div className="gold-divider mx-auto my-4 w-16" />
        <h2 className="font-display text-4xl text-stone-900 md:text-5xl">
          Curated textures, artisan-grade hardware
        </h2>
        <p className="mt-4 text-base leading-8 text-stone-600">
          Every pair begins with premium suede, velvet, and leather — finished with signature gold and silver bits.
        </p>
      </Reveal>

      <motion.div
        variants={staggerContainer(0.07, 0.1)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
      >
        {materials.map((material) => (
          <motion.div
            key={material.name}
            variants={staggerItem}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="group glass-panel glass-panel-hover flex h-full min-h-[140px] flex-col items-center justify-center rounded-2xl p-4 text-center"
          >
            <motion.div
              className="mb-4 aspect-square w-full max-w-[72px] rounded-full border border-stone-200 shadow-[inset_0_2px_8px_rgba(0,0,0,0.25)]"
              style={{ backgroundColor: material.color }}
              whileHover={{ rotate: 8 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            />
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600 transition group-hover:text-stone-200">
              {material.name}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </SectionShell>
  );
}
