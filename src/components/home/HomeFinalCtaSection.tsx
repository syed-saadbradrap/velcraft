"use client";

import { motion } from "framer-motion";
import { SectionShell } from "@/components/ui/SectionShell";
import { Button } from "@/components/ui/Button";
import { customizeUrl } from "@/lib/catalog/purchase";
import { homeContent } from "@/lib/content/velcraft";
import { staggerContainer, staggerItem } from "@/lib/motion";

export function HomeFinalCtaSection() {
  const { finalCta } = homeContent;

  return (
    <SectionShell tone="default" containerClassName="pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-[2rem] border border-accent/15 bg-[linear-gradient(135deg,rgba(201,169,98,0.12),rgba(255,255,255,0.02)_45%,rgba(12,10,9,0.9))] p-8 text-center md:p-14"
      >
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 gold-divider opacity-80" />

        <div className="relative mx-auto max-w-3xl space-y-6">
          <p className="text-xs uppercase tracking-[0.35em] text-accent">{finalCta.eyebrow}</p>
          <h2 className="font-display text-4xl leading-tight text-white md:text-5xl">{finalCta.title}</h2>
          <p className="text-base leading-8 text-stone-400 md:text-lg">{finalCta.description}</p>
          <p className="font-display text-xl text-accent md:text-2xl">{finalCta.subline}</p>
          <div className="pt-4">
            <Button href={customizeUrl()} size="lg">
              {finalCta.ctaLabel}
            </Button>
          </div>
        </div>
      </motion.div>
    </SectionShell>
  );
}
