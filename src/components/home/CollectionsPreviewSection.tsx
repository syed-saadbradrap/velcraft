"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { CollectionSummary } from "@/types/api";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionShell } from "@/components/ui/SectionShell";
import { Reveal } from "@/components/motion/Reveal";
import { normalizeImageUrl } from "@/lib/media";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface CollectionsPreviewSectionProps {
  collections: CollectionSummary[];
}

export function CollectionsPreviewSection({ collections }: CollectionsPreviewSectionProps) {
  return (
    <SectionShell tone="muted" containerClassName="space-y-14">
      <Reveal>
        <SectionHeading
          eyebrow="Collections"
          title="Three curated worlds of Velcraft expression"
          description="From signature suede mules to evening elegance and heritage classics — each collection is photographed, curated, and ready to shop."
          align="center"
        />
      </Reveal>

      <motion.div
        variants={staggerContainer(0.12, 0.05)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        {collections.map((collection) => {
          const image = normalizeImageUrl(
            collection.image_url,
            `/images/collections/${collection.slug}.svg`,
          );

          return (
            <motion.div key={collection.id} variants={staggerItem} className="h-full">
              <Link href={`/collection?collection=${collection.slug}`} className="group block h-full">
                <motion.article
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  className="glass-panel glass-panel-hover relative flex h-full min-h-[380px] flex-col overflow-hidden rounded-[1.75rem]"
                >
                  <div className="relative min-h-[200px] flex-1 overflow-hidden">
                    <Image
                      src={image}
                      alt={collection.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
                  </div>

                  <div className="relative p-6">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-accent">
                      {collection.shoes_count ?? 0} styles
                    </p>
                    <h3 className="mt-2 font-display text-2xl text-stone-900 xl:text-3xl">{collection.name}</h3>
                    {collection.description ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">{collection.description}</p>
                    ) : null}
                    <span className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-stone-600 transition group-hover:translate-x-1">
                      Explore collection
                      <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </motion.article>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </SectionShell>
  );
}
