"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ShoeSummary } from "@/types/api";
import { ShoeCard } from "@/components/catalog/ShoeCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionShell } from "@/components/ui/SectionShell";
import { Button } from "@/components/ui/Button";
import { isCustomizableShoe } from "@/lib/catalog/purchase";
import { luxuryEase } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface FeaturedShoesSectionProps {
  shoes: ShoeSummary[];
}

function useItemsPerView(count: number) {
  const [itemsPerView, setItemsPerView] = useState(1);

  useEffect(() => {
    function update() {
      if (window.innerWidth >= 1280) {
        setItemsPerView(Math.min(3, count));
      } else if (window.innerWidth >= 768) {
        setItemsPerView(Math.min(2, count));
      } else {
        setItemsPerView(1);
      }
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [count]);

  return itemsPerView;
}

export function FeaturedShoesSection({ shoes }: FeaturedShoesSectionProps) {
  const featuredIndex = shoes.findIndex((shoe) => isCustomizableShoe(shoe.slug));
  const ordered =
    featuredIndex > 0
      ? [shoes[featuredIndex], ...shoes.filter((_, index) => index !== featuredIndex)]
      : shoes;

  const count = ordered.length;
  const itemsPerView = useItemsPerView(count);
  const maxIndex = Math.max(0, count - itemsPerView);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setActive((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      if (index < 0) {
        setActive(maxIndex);
        return;
      }
      if (index > maxIndex) {
        setActive(0);
        return;
      }
      setActive(index);
    },
    [count, maxIndex],
  );

  const next = useCallback(() => goTo(active >= maxIndex ? 0 : active + 1), [active, maxIndex, goTo]);
  const prev = useCallback(() => goTo(active <= 0 ? maxIndex : active - 1), [active, maxIndex, goTo]);

  useEffect(() => {
    if (count <= itemsPerView || paused) return;
    const timer = window.setInterval(next, 5000);
    return () => window.clearInterval(timer);
  }, [count, itemsPerView, paused, next]);

  if (count === 0) {
    return null;
  }

  const slideWidth = 100 / itemsPerView;
  const showControls = count > itemsPerView;

  return (
    <SectionShell tone="default" containerClassName="space-y-14">
      <SectionHeading
        eyebrow="Featured Collection"
        title="Curated silhouettes from the Velcraft atelier"
        description="Studio-lit mules with concierge sizing. One signature style opens in the interactive atelier for full bespoke configuration."
        align="center"
      />

      <div className="flex justify-center">
        <Button href="/collection" variant="secondary" size="md">
          View Full Collection
        </Button>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="overflow-hidden px-1 md:px-12">
          <motion.div
            className="flex"
            animate={{ x: `-${active * slideWidth}%` }}
            transition={{ duration: 0.55, ease: luxuryEase }}
            drag={showControls ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.08}
            onDragEnd={(_, info) => {
              if (info.offset.x > 70 || info.velocity.x > 350) prev();
              else if (info.offset.x < -70 || info.velocity.x < -350) next();
            }}
          >
            {ordered.map((shoe, index) => (
              <div key={shoe.id} className="shrink-0 px-3" style={{ width: `${slideWidth}%` }}>
                <ShoeCard
                  shoe={shoe}
                  priority={index < 3}
                  featured={index === 0 && isCustomizableShoe(shoe.slug)}
                  variant="slider"
                  className="h-full"
                />
              </div>
            ))}
          </motion.div>
        </div>

        {showControls ? (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous products"
              className="absolute left-0 top-[42%] z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-stone-950/85 text-stone-300 backdrop-blur transition hover:border-accent/30 hover:text-white md:inline-flex"
            >
              ←
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next products"
              className="absolute right-0 top-[42%] z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-stone-950/85 text-stone-300 backdrop-blur transition hover:border-accent/30 hover:text-white md:inline-flex"
            >
              →
            </button>

            <div className="mt-8 flex items-center justify-center gap-3">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === active ? "true" : undefined}
                  onClick={() => goTo(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === active ? "w-8 bg-accent" : "w-2 bg-stone-600 hover:bg-stone-400",
                  )}
                />
              ))}
            </div>

            <div className="mt-5 flex justify-center gap-3 md:hidden">
              <button
                type="button"
                onClick={prev}
                className="inline-flex h-11 min-w-[110px] items-center justify-center rounded-full border border-border px-5 text-xs uppercase tracking-[0.2em] text-stone-300"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={next}
                className="inline-flex h-11 min-w-[110px] items-center justify-center rounded-full border border-accent/30 bg-accent/10 px-5 text-xs uppercase tracking-[0.2em] text-accent"
              >
                Next
              </button>
            </div>
          </>
        ) : null}
      </div>
    </SectionShell>
  );
}
