"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Testimonial } from "@/types/api";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionShell } from "@/components/ui/SectionShell";
import { luxuryEase } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  eyebrow?: string;
  title?: string;
  description?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <blockquote className="glass-panel flex min-h-[320px] flex-col rounded-[2rem] p-8 md:min-h-[360px] md:p-10">
      <span className="mb-4 font-display text-6xl leading-none text-accent/15">&ldquo;</span>
      <div className="mb-5 flex gap-1 text-accent">
        {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
          <span key={starIndex}>★</span>
        ))}
      </div>
      <p className="flex-1 text-xl leading-9 text-stone-100 md:text-2xl md:leading-10">
        {testimonial.content}
      </p>
      <footer className="mt-8 flex items-center gap-4 border-t border-border pt-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/25 bg-accent/10 font-display text-xl text-accent">
          {initials(testimonial.customer_name)}
        </div>
        <div>
          <p className="font-display text-2xl text-white">{testimonial.customer_name}</p>
          {testimonial.customer_title ? (
            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-stone-500">
              {testimonial.customer_title}
            </p>
          ) : null}
        </div>
      </footer>
    </blockquote>
  );
}

export function TestimonialsSection({
  testimonials,
  eyebrow = "Customer Reviews",
  title = "Loved by Every Step",
  description,
}: TestimonialsSectionProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = testimonials.length;

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return;
      setActive((index + count) % count);
    },
    [count],
  );

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % count);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [count, paused]);

  if (count === 0) {
    return null;
  }

  const testimonial = testimonials[active];

  return (
    <SectionShell tone="accent" containerClassName="space-y-14">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        align="center"
      />

      <div
        className="relative mx-auto max-w-4xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative overflow-hidden px-2 md:px-14">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -48 }}
              transition={{ duration: 0.45, ease: luxuryEase }}
              drag={count > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={(_, info) => {
                if (info.offset.x > 80 || info.velocity.x > 400) prev();
                else if (info.offset.x < -80 || info.velocity.x < -400) next();
              }}
            >
              <TestimonialCard testimonial={testimonial} />
            </motion.div>
          </AnimatePresence>
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous review"
              className="absolute left-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-stone-950/80 text-stone-300 backdrop-blur transition hover:border-accent/30 hover:text-white md:inline-flex"
            >
              ←
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next review"
              className="absolute right-0 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-stone-950/80 text-stone-300 backdrop-blur transition hover:border-accent/30 hover:text-white md:inline-flex"
            >
              →
            </button>

            <div className="mt-8 flex items-center justify-center gap-3">
              {testimonials.map((item, index) => (
                <button
                  key={item.customer_name}
                  type="button"
                  aria-label={`Go to review ${index + 1}`}
                  aria-current={index === active ? "true" : undefined}
                  onClick={() => goTo(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === active
                      ? "w-8 bg-accent"
                      : "w-2 bg-stone-600 hover:bg-stone-400",
                  )}
                />
              ))}
            </div>

            <div className="mt-5 flex justify-center gap-3 md:hidden">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous review"
                className="inline-flex h-11 min-w-[110px] items-center justify-center rounded-full border border-border px-5 text-xs uppercase tracking-[0.2em] text-stone-300"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next review"
                className="inline-flex h-11 min-w-[110px] items-center justify-center rounded-full border border-accent/30 bg-accent/10 px-5 text-xs uppercase tracking-[0.2em] text-accent"
              >
                Next
              </button>
            </div>

            <p className="mt-4 text-center text-[11px] uppercase tracking-[0.24em] text-stone-600">
              {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
            </p>
          </>
        ) : null}
      </div>
    </SectionShell>
  );
}
