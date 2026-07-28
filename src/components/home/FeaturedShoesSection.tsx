"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ShoeSummary } from "@/types/api";
import { ShoeCard } from "@/components/catalog/ShoeCard";
import { SectionShell } from "@/components/ui/SectionShell";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { homeContent } from "@/lib/content/velcraft";
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
  const { products } = homeContent;

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
    const timer = window.setInterval(next, 5500);
    return () => window.clearInterval(timer);
  }, [count, itemsPerView, paused, next]);

  if (count === 0) {
    return null;
  }

  const slideWidth = 100 / itemsPerView;
  const showControls = count > itemsPerView;

  return (
    <SectionShell tone="muted" containerClassName="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative grid gap-12 xl:grid-cols-[minmax(280px,360px)_1fr] xl:items-start xl:gap-14">
        <Reveal className="space-y-8 xl:sticky xl:top-28">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.35em] text-accent">{products.eyebrow}</p>
            <div className="gold-divider w-16" />
            <h2 className="font-display text-4xl leading-tight text-white md:text-5xl">{products.title}</h2>
            <p className="text-base leading-8 text-stone-400">{products.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {products.stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-white/[0.03] px-3 py-4 text-center">
                <p className="font-display text-2xl text-white">{stat.value}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.18em] text-stone-500">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button href="/collection" size="lg">
              View Full Collection
            </Button>
            <Button href={homeContent.hero.ctaUrl} variant="secondary" size="lg">
              {homeContent.hero.ctaLabel}
            </Button>
          </div>
        </Reveal>

        <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
              {count} styles · swipe or use arrows
            </p>
            {showControls ? (
              <div className="hidden items-center gap-2 sm:flex">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous products"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-stone-950/80 text-stone-300 transition hover:border-accent/30 hover:text-white"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next products"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-stone-950/80 text-stone-300 transition hover:border-accent/30 hover:text-white"
                >
                  →
                </button>
              </div>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-border/80 bg-stone-950/40 p-3 sm:p-4">
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
                <div key={shoe.id} className="shrink-0 px-2" style={{ width: `${slideWidth}%` }}>
                  <ShoeCard
                    shoe={shoe}
                    priority={index < 2}
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
              <div className="mt-6 flex items-center justify-center gap-3">
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

              <div className="mt-4 flex justify-center gap-3 sm:hidden">
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
      </div>
    </SectionShell>
  );
}
