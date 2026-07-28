"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { HeroSlide } from "@/types/api";
import { normalizeImageUrl } from "@/lib/media";
import { homeContent } from "@/lib/content/velcraft";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { TextReveal } from "@/components/motion/TextReveal";

interface HeroSectionProps {
  slides: HeroSlide[];
}

export function HeroSection({ slides }: HeroSectionProps) {
  const slide = slides[0];
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.3]);

  if (!slide) {
    return null;
  }

  const heroImage = normalizeImageUrl(slide.image_url, "/images/hero/main.jpg");
  const titleParts = (slide.title ?? homeContent.hero.title).split(".");
  const titleLead = titleParts[0]?.trim() || "Your Shoes";
  const titleAccent = titleParts.slice(1).join(".").trim() || "Your Signature";

  return (
    <section ref={ref} className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 hero-grid-pattern opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(201,169,98,0.2),transparent_34%),radial-gradient(circle_at_82%_8%,rgba(255,255,255,0.07),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(201,169,98,0.08),transparent_40%)]" />
      <motion.div
        style={{ opacity }}
        className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl pulse-glow"
      />
      <div className="absolute -right-16 bottom-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

      <Container className="relative grid min-h-[88vh] items-center gap-14 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <motion.div style={{ y: contentY }} className="space-y-9">
          <h1 className="font-display text-5xl leading-[1.02] text-white md:text-6xl xl:text-7xl">
            <TextReveal text={titleLead} as="span" className="block" delay={0.15} />
            {titleAccent ? (
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.55 }}
                className="mt-2 block luxury-gradient"
              >
                {titleAccent}
              </motion.span>
            ) : null}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="max-w-xl text-lg leading-8 text-stone-400 md:text-xl md:leading-9"
          >
            {slide.description ?? homeContent.hero.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
          >
            <Button href={slide.cta_url ?? homeContent.hero.ctaUrl} size="lg">
              {slide.cta_label ?? homeContent.hero.ctaLabel}
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: imageY }}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="glass-panel relative overflow-hidden rounded-[2rem] border-accent/15 bg-[linear-gradient(180deg,#f5f0e8_0%,#e8e2d8_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <div className="relative aspect-[4/5]">
              <Image
                src={heroImage}
                alt={slide.title ?? homeContent.hero.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-contain p-8"
              />
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
