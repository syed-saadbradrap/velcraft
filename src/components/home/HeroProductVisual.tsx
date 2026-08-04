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
      <div className="hero-visual-backdrop pointer-events-none absolute inset-[2%] rounded-[1.75rem] bg-[radial-gradient(circle_at_50%_62%,rgba(255,255,255,0.92)_0%,rgba(250,246,238,0.55)_42%,transparent_72%)] dark:bg-[radial-gradient(circle_at_50%_62%,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_42%,transparent_72%)] sm:inset-[4%] sm:rounded-[2.5rem] lg:inset-[2%] lg:rounded-[3rem]" />
      <div className="pointer-events-none absolute left-1/2 top-[58%] h-[18%] w-[72%] -translate-x-1/2 rounded-full bg-accent/16 blur-3xl" />

      <motion.div
        className="hero-shoe-3d-stage relative mx-auto aspect-[4/3] w-full max-w-none sm:aspect-[16/11] md:aspect-[5/3] lg:aspect-[11/6]"
        style={{ rotateX, rotateY, transformPerspective: 1600 }}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
          className="group relative flex h-full w-full items-center justify-center px-1 py-4 sm:px-4 sm:py-8"
        >
          <div className="relative h-full w-full max-w-[980px]">
            <div className="hero-visual-pedestal pointer-events-none absolute bottom-[6%] left-1/2 h-[14%] w-[68%] -translate-x-1/2 rounded-full" />
            <Image
              src={src}
              alt={alt}
              fill
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 58vw"
              className="object-contain object-center drop-shadow-[0_40px_70px_rgba(28,25,23,0.22)] transition-transform duration-700 group-hover:scale-[1.015]"
            />
          </div>
        </motion.div>
      </motion.div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 px-1 sm:absolute sm:inset-x-0 sm:bottom-[10%] sm:mt-0 sm:justify-between sm:px-4 lg:px-6">
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
