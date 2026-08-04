"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { HeroSlide } from "@/types/api";
import { homeContent } from "@/lib/content/velcraft";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { HeroProductVisual } from "@/components/home/HeroProductVisual";
import { normalizeImageUrl } from "@/lib/media";

interface HeroSectionProps {
  slides: HeroSlide[];
}

function resolveHeroSlide(slides: HeroSlide[]): HeroSlide | null {
  if (slides.length === 0) {
    return null;
  }

  const preferred = slides.find((slide) => slide.title?.includes("Your Shoes"));
  return preferred ?? slides[0];
}

function resolveHeroCopy(slide: HeroSlide) {
  const title = slide.title?.trim() || homeContent.hero.title;
  const eyebrow = slide.subtitle?.trim() || homeContent.hero.eyebrow;
  const titleParts = title.split(".").map((part) => part.trim()).filter(Boolean);

  if (titleParts.length >= 2) {
    return {
      eyebrow,
      lead: `${titleParts[0]}.`,
      accent: `${titleParts.slice(1).join(".")}.`.replace(/\.\./g, "."),
      description: slide.description ?? homeContent.hero.description,
    };
  }

  return {
    eyebrow,
    lead: title.endsWith(".") ? title : `${title}.`,
    accent: homeContent.hero.titleAccent,
    description: slide.description ?? homeContent.hero.description,
  };
}

export function HeroSection({ slides }: HeroSectionProps) {
  const slide = resolveHeroSlide(slides);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.25]);

  if (!slide) {
    return null;
  }

  const copy = resolveHeroCopy(slide);
  const heroImage = normalizeImageUrl(slide.image_url, homeContent.hero.image);
  const primaryCta = slide.cta_url ?? homeContent.hero.ctaUrl;
  const primaryLabel = slide.cta_label ?? homeContent.hero.ctaLabel;

  return (
    <section ref={ref} className="hero-premium relative overflow-hidden border-b border-border">
      <div className="hero-premium-grid absolute inset-0 opacity-50" />
      <div className="hero-premium-glow absolute inset-0" />
      <div className="absolute inset-x-0 top-0 gold-divider opacity-70" />

      <motion.div
        style={{ opacity }}
        className="pointer-events-none absolute -left-20 top-16 h-80 w-80 rounded-full bg-accent/12 blur-3xl"
      />
      <motion.div
        style={{ opacity }}
        className="pointer-events-none absolute right-0 top-1/3 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(201,169,98,0.14),transparent_70%)] blur-2xl"
      />

      <Container className="relative z-10 grid min-h-[82vh] items-center gap-10 py-16 lg:grid-cols-2 lg:gap-12 lg:py-20 xl:gap-16">
        <motion.div style={{ y: contentY }} className="order-2 space-y-8 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="inline-flex items-center gap-3 rounded-full border border-accent/25 bg-white/70 px-4 py-2 shadow-[0_8px_30px_rgba(28,25,23,0.04)] backdrop-blur-sm dark:bg-stone-900/60"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-[10px] uppercase tracking-[0.32em] text-stone-600">{copy.eyebrow}</span>
          </motion.div>

          <h1 className="overflow-visible font-display text-[clamp(2.75rem,6vw,4.75rem)] leading-[1.02] text-stone-900">
            <TextReveal text={copy.lead} as="span" className="block overflow-visible pb-1" delay={0.12} />
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
              className="mt-1 block overflow-visible pb-1 luxury-gradient"
            >
              {copy.accent}
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.58 }}
            className="max-w-xl text-base leading-8 text-stone-600 md:text-lg md:leading-9"
          >
            {copy.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.68 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Button href={primaryCta} size="lg">
              {primaryLabel}
            </Button>
            <Link
              href={homeContent.hero.ctaSecondaryUrl}
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-4 text-sm font-medium text-stone-700 transition hover:border-accent/35 hover:text-stone-900"
            >
              {homeContent.hero.ctaSecondaryLabel}
              <span aria-hidden="true">→</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.78 }}
            className="grid max-w-xl grid-cols-3 gap-3 pt-2"
          >
            {homeContent.hero.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-[1.25rem] border border-border/80 bg-white/60 px-4 py-4 backdrop-blur-sm dark:bg-stone-900/50"
              >
                <p className="font-display text-2xl text-stone-900">{stat.value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-stone-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: imageY }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative order-1 w-full min-w-0 lg:order-2"
        >
          <HeroProductVisual
            imageUrl={heroImage}
            alt={`${copy.lead} ${copy.accent}`}
          />
        </motion.div>
      </Container>

      <div className="absolute inset-x-0 bottom-0 gold-divider opacity-50" />
    </section>
  );
}
