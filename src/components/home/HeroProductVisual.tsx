"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { normalizeImageUrl } from "@/lib/media";
import { homeContent } from "@/lib/content/velcraft";

interface HeroProductVisualProps {
  imageUrl?: string | null;
  alt: string;
}

export function HeroProductVisual({ imageUrl, alt }: HeroProductVisualProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [4, -4]), {
    stiffness: 150,
    damping: 24,
  });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-7, 7]), {
    stiffness: 150,
    damping: 24,
  });

  const src = normalizeImageUrl(imageUrl, homeContent.hero.image);

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) {
      return;
    }

    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  }

  function resetPointer() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <div
      ref={containerRef}
      className="hero-shoe-scene relative w-full"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <motion.div
        className="hero-shoe-3d-stage relative mx-auto w-full max-w-[420px] sm:max-w-[460px] lg:max-w-[500px]"
        style={{ rotateX, rotateY, transformPerspective: 1600 }}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
          className="group relative"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white shadow-[0_24px_60px_rgba(28,25,23,0.12)] sm:rounded-[2.25rem] lg:rounded-[2.5rem]">
            <div className="relative aspect-[3/4] w-full">
              <Image
                src={src}
                alt={alt}
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 640px) 88vw, (max-width: 1024px) 42vw, 500px"
                className="object-contain object-center p-4 transition-transform duration-700 group-hover:scale-[1.02] sm:p-5 lg:p-6"
              />
            </div>
          </div>
          <div className="pointer-events-none absolute -bottom-4 left-1/2 h-8 w-[72%] -translate-x-1/2 rounded-full bg-stone-900/10 blur-xl" />
        </motion.div>
      </motion.div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 px-1 lg:absolute lg:inset-x-0 lg:bottom-[10%] lg:mt-0 lg:justify-between lg:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.85 }}
          className="rounded-full border border-stone-200/80 bg-white/90 px-3 py-2 text-[9px] uppercase tracking-[0.2em] text-stone-600 shadow-sm backdrop-blur-md dark:border-stone-700 dark:bg-stone-900/85 sm:px-4 sm:text-[10px] sm:tracking-[0.24em]"
        >
          Live 3D Studio
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.95 }}
          className="rounded-full border border-accent/25 bg-accent/12 px-3 py-2 text-[9px] uppercase tracking-[0.2em] text-accent shadow-sm backdrop-blur-sm sm:px-4 sm:text-[10px] sm:tracking-[0.24em]"
        >
          Premium Finish
        </motion.div>
      </div>
    </div>
  );
}
