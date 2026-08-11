"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

function NavArrow({ direction, onClick }: { direction: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous products" : "Next products"}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-sm transition hover:border-accent/40 hover:text-accent hover:shadow-md"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        {direction === "prev" ? (
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
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

  const showControls = count > itemsPerView;
  const visibleShoes = ordered.slice(active, active + itemsPerView);
  const slideShare = 100 / count;
  const trackOffset = (active / count) * 100;

  return (
    <SectionShell tone="muted" containerClassName="relative min-w-0 overflow-x-clip">
      <div className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-accent/8 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-stone-200/40 blur-3xl" />

      <div className="relative grid min-w-0 gap-10 sm:gap-12 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)] xl:items-start xl:gap-16">
        <Reveal className="min-w-0 space-y-6 sm:space-y-8 xl:sticky xl:top-28">
          <div className="accent-bar-left min-w-0 space-y-4 sm:space-y-5">
            <p className="text-xs uppercase tracking-[0.35em] text-accent">{products.eyebrow}</p>
            <h2 className="break-words font-display text-[clamp(1.75rem,6vw,3rem)] leading-[1.08] text-stone-900">
              {products.title}
            </h2>
            <p className="max-w-full text-base leading-7 text-stone-600 sm:leading-8">{products.description}</p>
          </div>

          <div className="grid min-w-0 grid-cols-3 gap-2 sm:gap-3">
            {products.stats.map((stat) => (
              <div
                key={stat.label}
                className="group min-w-0 rounded-2xl border border-stone-200/80 bg-white px-2 py-3.5 text-center shadow-[0_8px_24px_rgba(28,25,23,0.05)] transition hover:-translate-y-0.5 hover:border-accent/25 hover:shadow-[0_16px_32px_rgba(28,25,23,0.08)] sm:px-3 sm:py-5"
              >
                <p className="font-display text-base leading-tight text-stone-900 transition group-hover:text-accent sm:text-xl xl:text-2xl">
                  {stat.value}
                </p>
                <p className="mt-1.5 break-words text-[8px] uppercase leading-tight tracking-[0.12em] text-stone-600 sm:mt-2 sm:text-[9px] sm:tracking-[0.2em]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
            <Button href="/collection" size="md" className="w-full px-4 text-sm">
              View Full Collection
            </Button>
            <Button href={homeContent.hero.ctaUrl} variant="secondary" size="md" className="w-full px-4 text-sm">
              {homeContent.hero.ctaLabel}
            </Button>
          </div>
        </Reveal>

        <div className="min-w-0 overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500">Curated Selection</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={visibleShoes.map((shoe) => shoe.slug).join("-")}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="mt-1 truncate font-display text-xl text-stone-900 md:text-2xl"
                >
                  {visibleShoes.length === 1
                    ? visibleShoes[0]?.name
                    : `${visibleShoes[0]?.name} · ${visibleShoes[1]?.name}`}
                </motion.p>
              </AnimatePresence>
            </div>

            {showControls ? (
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden text-[11px] uppercase tracking-[0.22em] text-stone-500 sm:inline">
                  {String(active + 1).padStart(2, "0")} / {String(maxIndex + 1).padStart(2, "0")}
                </span>
                <div className="hidden items-center gap-2 sm:flex">
                  <NavArrow direction="prev" onClick={prev} />
                  <NavArrow direction="next" onClick={next} />
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative w-full min-w-0 overflow-hidden rounded-[1.5rem] border border-stone-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8f6f2_100%)] p-2 shadow-[0_24px_60px_rgba(28,25,23,0.07)] sm:rounded-[2rem] sm:p-4">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

            <div className="w-full min-w-0 overflow-hidden">
              <motion.div
                className="flex min-w-0"
                style={{ width: `${(count * 100) / itemsPerView}%` }}
                animate={{ x: `-${trackOffset}%` }}
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
                  <div
                    key={shoe.id}
                    className="min-w-0 shrink-0 grow-0 px-1 sm:px-2"
                    style={{ flexBasis: `${slideShare}%`, maxWidth: `${slideShare}%` }}
                  >
                    <ShoeCard
                      shoe={shoe}
                      priority={index < 2}
                      featured={index === 0 && isCustomizableShoe(shoe.slug)}
                      variant="slider"
                      className="w-full min-w-0"
                    />
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

          {showControls ? (
            <>
              <div className="mt-6 flex items-center justify-center gap-2.5">
                {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={index === active ? "true" : undefined}
                    onClick={() => goTo(index)}
                    className={cn(
                      "rounded-full transition-all duration-300",
                      index === active
                        ? "h-2 w-10 bg-accent shadow-[0_0_12px_rgba(184,148,63,0.35)]"
                        : "h-2 w-2 bg-stone-300 hover:bg-stone-400",
                    )}
                  />
                ))}
              </div>

              <div className="mt-4 flex justify-center gap-3 sm:hidden">
                <button
                  type="button"
                  onClick={prev}
                  className="inline-flex h-11 min-w-[110px] items-center justify-center rounded-full border border-stone-200 bg-white px-5 text-xs uppercase tracking-[0.2em] text-stone-600 shadow-sm"
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
