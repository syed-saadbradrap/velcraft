"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { HeroSlide } from "@/types/api";
import { normalizeImageUrl } from "@/lib/media";
import { homeContent } from "@/lib/content/velcraft";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { TextReveal } from "@/components/motion/TextReveal";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface HeroSectionProps {
  slides: HeroSlide[];
}

const stats = homeContent.hero.stats;

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
  const titleParts = slide.title?.split(".") ?? ["Your Shoes", "Your Signature"];
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
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent shimmer-line" />

      <Container className="relative grid min-h-[88vh] items-center gap-14 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <motion.div style={{ y: contentY }} className="space-y-9">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-3 rounded-full border border-accent/20 bg-accent/5 px-4 py-2 backdrop-blur"
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_12px_rgba(201,169,98,0.8)]"
            />
            <p className="text-[11px] uppercase tracking-[0.32em] text-accent">
              {slide.subtitle ?? "Velcraft Atelier"}
            </p>
          </motion.div>

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

          {slide.description ? (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="max-w-xl text-lg leading-8 text-stone-400 md:text-xl md:leading-9"
            >
              {slide.description}
            </motion.p>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="flex flex-wrap gap-4"
          >
            <Button href={slide.cta_url ?? "/customize/ivory-gold-bit-mule"} size="lg">
              {slide.cta_label ?? "Customize Now"}
            </Button>
            <Button href="/collection" variant="secondary" size="lg">
              View Collection
            </Button>
          </motion.div>

          <motion.div
            variants={staggerContainer(0.08, 0.85)}
            initial="hidden"
            animate="visible"
            className="grid gap-4 sm:grid-cols-3"
          >
            {stats.map((item) => (
              <motion.div
                key={item.label}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                className="glass-panel glass-panel-hover rounded-2xl px-5 py-4"
              >
                <p className="font-display text-3xl text-white md:text-4xl">{item.value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-stone-500">
                  {item.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: imageY }}
          initial={{ opacity: 0, scale: 0.94, rotateY: -8 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative [perspective:1200px]"
        >
          <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-accent/20 via-transparent to-white/5 blur-2xl" />
          <motion.div
            whileHover={{ rotateY: 4, rotateX: -2 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="glass-panel relative overflow-hidden rounded-[2rem] border-accent/15 bg-[linear-gradient(180deg,#f5f0e8_0%,#e8e2d8_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
          >
            <div className="relative aspect-[4/5]">
              <Image
                src={heroImage}
                alt={slide.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-contain p-8 transition duration-700 hover:scale-[1.03]"
              />

              <motion.div
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="absolute left-6 top-6 rounded-full border border-accent/30 bg-stone-950/75 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-accent backdrop-blur"
              >
                New Season
              </motion.div>

              <Link
                href="/customize/ivory-gold-bit-mule"
                className="float-soft absolute right-6 top-6 hidden rounded-2xl border border-white/10 bg-stone-950/80 px-4 py-3 backdrop-blur transition hover:border-accent/30 sm:block"
              >
                <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">3D Atelier</p>
                <p className="mt-1 font-display text-lg text-white">Live preview</p>
              </Link>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent p-8">
                <p className="text-xs uppercase tracking-[0.35em] text-accent">Interactive 3D Atelier</p>
                <p className="mt-2 font-display text-3xl text-white">Configure in real time</p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-stone-400">
                  Materials, hardware, and sole finishes update instantly as you design.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Container>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-stone-500 lg:flex"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <span className="block h-10 w-px bg-gradient-to-b from-accent/70 to-transparent" />
      </motion.div>
    </section>
  );
}
