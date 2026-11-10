"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShoeGalleryProps {
  images: string[];
  alt: string;
}

export function ShoeGallery({ images, alt }: ShoeGalleryProps) {
  const gallery = images.length > 0 ? images : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = gallery[activeIndex] ?? gallery[0];

  if (!activeImage) {
    return null;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="glass-panel relative aspect-square overflow-hidden rounded-[1.5rem] bg-white sm:aspect-[4/5] sm:rounded-[2rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeImage}
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={activeImage}
              alt={`${alt} — view ${activeIndex + 1}`}
              fill
              priority={activeIndex === 0}
              loading={activeIndex === 0 ? "eager" : "lazy"}
              fetchPriority={activeIndex === 0 ? "high" : "auto"}
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-contain p-4 sm:p-8 md:p-10"
            />
          </motion.div>
        </AnimatePresence>

        {gallery.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => setActiveIndex((index) => (index === 0 ? gallery.length - 1 : index - 1))}
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 text-stone-700 shadow-sm transition hover:border-accent/35 hover:text-stone-900 sm:left-4"
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => setActiveIndex((index) => (index === gallery.length - 1 ? 0 : index + 1))}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 text-stone-700 shadow-sm transition hover:border-accent/35 hover:text-stone-900 sm:right-4"
            >
              →
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-border bg-white/90 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-stone-600">
              {activeIndex + 1} / {gallery.length}
            </div>
          </>
        ) : null}
      </div>

      {gallery.length > 1 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5">
          {gallery.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              aria-label={`Show image ${index + 1}`}
              aria-current={activeIndex === index}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-[1rem] border bg-white transition",
                activeIndex === index
                  ? "border-accent ring-2 ring-accent/20"
                  : "border-border hover:border-accent/30",
              )}
            >
              <Image
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                fill
                loading="lazy"
                sizes="120px"
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
