"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionShell } from "@/components/ui/SectionShell";
import { Button } from "@/components/ui/Button";
import { FaqSection } from "@/components/home/FaqSection";
import { Reveal } from "@/components/motion/Reveal";
import { aboutContent } from "@/lib/content/velcraft";
import { customizeUrl } from "@/lib/catalog/purchase";
import { staggerContainer, staggerItem } from "@/lib/motion";

export function AboutPageContent() {
  const { hero, story, process, whyChoose, faqs, finalCta } = aboutContent;

  return (
    <>
      <section className="relative overflow-hidden border-b border-border py-24 md:py-32">
        <div className="absolute inset-0 hero-grid-pattern opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,169,98,0.16),transparent_35%)]" />
        <Container className="relative max-w-4xl">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.35em] text-accent">{hero.eyebrow}</p>
            <h1 className="mt-5 font-display text-5xl leading-tight text-white md:text-6xl">{hero.title}</h1>
            <p className="mt-6 text-lg leading-8 text-stone-400 md:text-xl md:leading-9">{hero.description}</p>
          </Reveal>
        </Container>
      </section>

      <SectionShell tone="muted" containerClassName="max-w-4xl space-y-8">
        <SectionHeading eyebrow={story.eyebrow} title={story.title} align="center" />
        <div className="space-y-6 text-base leading-8 text-stone-400 md:text-lg md:leading-9">
          {story.paragraphs.map((paragraph) => (
            <Reveal key={paragraph}>
              <p>{paragraph}</p>
            </Reveal>
          ))}
        </div>
      </SectionShell>

      <SectionShell tone="default" containerClassName="space-y-14">
        <SectionHeading
          eyebrow={process.eyebrow}
          title={process.title}
          description={process.description}
          align="center"
        />

        <motion.div
          variants={staggerContainer(0.08, 0.05)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-6 md:grid-cols-2"
        >
          {process.steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={staggerItem}
              className="glass-panel glass-panel-hover rounded-[1.75rem] p-8"
            >
              <p className="font-display text-4xl text-accent/70">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-4 font-display text-2xl text-white md:text-3xl">{step.title}</h3>
              <p className="mt-4 text-sm leading-7 text-stone-400 md:text-base md:leading-8">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </SectionShell>

      <SectionShell tone="accent" containerClassName="space-y-10">
        <SectionHeading eyebrow={whyChoose.eyebrow} title={whyChoose.title} align="center" />
        <motion.ul
          variants={staggerContainer(0.06, 0.05)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto grid max-w-3xl gap-4"
        >
          {whyChoose.items.map((item) => (
            <motion.li
              key={item}
              variants={staggerItem}
              className="flex items-start gap-4 rounded-2xl border border-border bg-white/[0.03] px-6 py-4"
            >
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent/10 text-[10px] text-accent">
                ✓
              </span>
              <span className="text-sm leading-7 text-stone-300 md:text-base">{item}</span>
            </motion.li>
          ))}
        </motion.ul>
      </SectionShell>

      <FaqSection
        faqs={faqs}
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        description="Learn more about Velcraft's history, customization platform, materials, and ordering process."
      />

      <SectionShell tone="default" containerClassName="pb-8">
        <Reveal className="relative overflow-hidden rounded-[2rem] border border-accent/15 bg-[linear-gradient(135deg,rgba(201,169,98,0.12),rgba(12,10,9,0.92))] p-8 text-center md:p-14">
          <h2 className="font-display text-4xl leading-tight text-white md:text-5xl">{finalCta.title}</h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-stone-400 md:text-lg">{finalCta.description}</p>
          <div className="mt-8">
            <Button href={customizeUrl()} size="lg">
              {finalCta.ctaLabel}
            </Button>
          </div>
        </Reveal>
      </SectionShell>
    </>
  );
}
