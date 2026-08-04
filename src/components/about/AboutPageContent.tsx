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

const processLabels = ["Foundation", "Personalization", "Preview", "Production"] as const;

function ProcessStepIcon({ index }: { index: number }) {
  if (index === 1) {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3c-4.5 0-8 3.2-8 7.5 0 2.2 1 4.1 2.6 5.4.8.7 1.2 1.7 1.2 2.7V20a1 1 0 001 1h6a1 1 0 001-1v-1.4c0-1 .4-2 1.2-2.7 1.6-1.3 2.6-3.2 2.6-5.4C18 6.2 14.5 3 12 3z" />
        <circle cx="8.5" cy="10" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
        <circle cx="15.5" cy="10" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (index === 2) {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 8l8-4 8 4v8l-8 4-8-4V8z" />
        <path d="M12 12v8M4 8l8 4 8-4" />
      </svg>
    );
  }

  if (index === 3) {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 7h11v8H3zM14 10h4l3 3v2h-7v-5z" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="18" cy="17" r="2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 9l7-4 7 4v6l-7 4-7-4V9z" />
      <path d="M12 13v6M5 9l7 4 7-4" />
    </svg>
  );
}

export function AboutPageContent() {
  const { hero, story, process, whyChoose, faqs, finalCta } = aboutContent;
  const heroTitleParts = hero.title.split(".");
  const heroLead = heroTitleParts[0]?.trim() ? `${heroTitleParts[0]?.trim()}.` : hero.title;
  const heroAccent = heroTitleParts.slice(1).join(".").trim();
  const combinedStory = story.paragraphs.join(" ");

  return (
    <>
      <section className="relative overflow-hidden border-b border-border py-16 md:py-24">
        <div className="absolute inset-0 hero-grid-pattern opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(201,169,98,0.18),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,0.5),transparent_28%)]" />
        <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-stone-200/40 blur-3xl" />

        <Container className="relative max-w-5xl">
          <Reveal>
            <div className="accent-bar-left max-w-4xl space-y-6">
              <h1 className="font-display text-5xl leading-[1.04] text-stone-900 md:text-6xl xl:text-7xl">
                <span className="block">{heroLead}</span>
                {heroAccent ? (
                  <span className="mt-3 block luxury-gradient">{heroAccent.endsWith(".") ? heroAccent : `${heroAccent}.`}</span>
                ) : null}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-stone-600 md:text-xl md:leading-9">{hero.description}</p>
            </div>
          </Reveal>
        </Container>
      </section>

      <SectionShell tone="muted">
        <div className="grid gap-10 lg:grid-cols-[minmax(280px,360px)_1fr] lg:items-start lg:gap-14">
          <Reveal className="lg:sticky lg:top-28">
            <SectionHeading eyebrow={story.eyebrow} title={story.title} align="left" />
          </Reveal>

          <Reveal>
            <div className="glass-panel glass-panel-hover rounded-[1.75rem] p-8 md:p-10">
              <p className="text-base leading-8 text-stone-600 md:text-lg md:leading-9">{combinedStory}</p>
            </div>
          </Reveal>
        </div>
      </SectionShell>

      <SectionShell tone="default" containerClassName="space-y-12">
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
          className="relative grid gap-6 md:grid-cols-2"
        >
          <div className="pointer-events-none absolute left-[25%] right-[25%] top-14 hidden h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent md:block" />

          {process.steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={staggerItem}
              className="glass-panel glass-panel-hover relative flex h-full flex-col rounded-[1.75rem] p-8 md:min-h-[300px]"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10">
                  <ProcessStepIcon index={index} />
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl text-accent/80">{String(index + 1).padStart(2, "0")}</p>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-stone-600">{processLabels[index]}</p>
                </div>
              </div>

              <h3 className="font-display text-2xl text-stone-900 md:text-3xl">{step.title}</h3>
              <p className="mt-4 text-sm leading-7 text-stone-600 md:text-base md:leading-8">{step.description}</p>

              {"bullets" in step && Array.isArray(step.bullets) && step.bullets.length > 0 ? (
                <ul className="mt-5 space-y-3 border-t border-border pt-5">
                  {step.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-sm leading-7 text-stone-600 md:text-base">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent/10 text-[10px] text-accent">
                        ✓
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </motion.div>
          ))}
        </motion.div>
      </SectionShell>

      <SectionShell tone="accent" containerClassName="space-y-12">
        <SectionHeading eyebrow={whyChoose.eyebrow} title={whyChoose.title} align="center" />

        <motion.div
          variants={staggerContainer(0.06, 0.05)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {whyChoose.items.map((item, index) => (
            <motion.div
              key={item}
              variants={staggerItem}
              className="glass-panel glass-panel-hover flex h-full flex-col rounded-[1.75rem] p-7 md:p-8"
            >
              <p className="font-display text-5xl text-stone-900/25 dark:text-white/45">{String(index + 1).padStart(2, "0")}</p>
              <p className="mt-4 flex-1 text-sm leading-7 text-stone-600 md:text-base md:leading-8">{item}</p>
            </motion.div>
          ))}
        </motion.div>
      </SectionShell>

      <FaqSection faqs={faqs} title="Frequently Asked Questions" showSidebar={false} />

      <SectionShell tone="default" containerClassName="pb-6">
        <Reveal className="luxury-cta-panel rounded-[2rem] p-8 text-center md:p-12">
          <div className="absolute inset-x-8 top-0 gold-divider opacity-80" />
          <div className="relative mx-auto max-w-3xl space-y-5 md:space-y-6">
            <h2 className="font-display text-4xl leading-tight text-stone-900 md:text-5xl">{finalCta.title}</h2>
            <p className="mx-auto max-w-2xl text-base leading-8 text-stone-600 md:text-lg">{finalCta.description}</p>
            <div className="flex justify-center pt-2 md:pt-4">
              <Button href={customizeUrl()} size="lg">
                {finalCta.ctaLabel}
              </Button>
            </div>
          </div>
        </Reveal>
      </SectionShell>
    </>
  );
}
