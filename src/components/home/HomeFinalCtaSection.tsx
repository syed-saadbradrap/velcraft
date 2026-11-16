"use client";

import { motion } from "framer-motion";
import { SectionShell } from "@/components/ui/SectionShell";
import { Button } from "@/components/ui/Button";
import { customizeUrl } from "@/lib/catalog/purchase";
import { homeContent } from "@/lib/content/velcraft";

export function HomeFinalCtaSection({
  title,
  description,
  subline,
  ctaLabel,
  ctaUrl,
}: {
  title?: string | null;
  description?: string | null;
  subline?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
}) {
  const { finalCta } = homeContent;
  const copy = {
    title: title || finalCta.title,
    description: description || finalCta.description,
    subline: subline || finalCta.subline,
    ctaLabel: ctaLabel || finalCta.ctaLabel,
    ctaUrl: ctaUrl || customizeUrl(),
  };

  return (
    <SectionShell tone="default" containerClassName="pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="luxury-cta-panel rounded-[2rem] p-8 text-center md:p-14"
      >
        <div className="absolute inset-x-8 top-0 gold-divider opacity-80" />

        <div className="relative mx-auto max-w-3xl space-y-5 md:space-y-6">
          <h2 className="font-display text-4xl leading-tight text-stone-900 md:text-5xl">{copy.title}</h2>
          <p className="mx-auto max-w-2xl text-base leading-8 text-stone-600 md:text-lg">{copy.description}</p>
          <p className="font-display text-xl text-accent md:text-2xl">{copy.subline}</p>
          <div className="flex justify-center pt-2 md:pt-4">
            <Button href={copy.ctaUrl} size="lg">
              {copy.ctaLabel}
            </Button>
          </div>
        </div>
      </motion.div>
    </SectionShell>
  );
}
