"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface FaqEntry {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faqs: readonly FaqEntry[];
  eyebrow?: string;
  title?: string;
  description?: string;
}

function FaqItem({
  question,
  answer,
  open,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="glass-panel overflow-hidden rounded-2xl"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left transition hover:bg-white/[0.02]"
      >
        <span className="font-display text-xl text-white md:text-2xl">{question}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/25 text-accent"
          aria-hidden
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="border-t border-border px-6 pb-5 pt-4 text-sm leading-7 text-stone-400 md:text-base md:leading-8">
              {answer}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export function FaqSection({
  faqs,
  eyebrow = "FAQ",
  title = "Frequently Asked Questions",
  description = "Everything you need to know about customization, sizing, materials, and orders.",
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative border-y border-border py-24 md:py-28">
      <div className="absolute inset-0 section-glow" />
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
          <Reveal className="lg:sticky lg:top-28">
            <SectionHeading eyebrow={eyebrow} title={title} description={description} />
            <div className="mt-8 hidden rounded-2xl border border-border bg-white/[0.03] p-6 lg:block">
              <p className="text-xs uppercase tracking-[0.28em] text-accent">Need more help?</p>
              <p className="mt-3 text-sm leading-7 text-stone-400">
                Our team is available Mon–Sat, 12:00 PM – 10:00 PM.
              </p>
              <p className="mt-2 text-sm text-stone-300">{siteConfig.contact.email}</p>
              <div className="mt-5">
                <Button href={siteConfig.links.contact} variant="secondary" size="sm">
                  Contact Us
                </Button>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-4">
            {faqs.map((faq, index) => (
              <FaqItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                index={index}
                open={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>

        <Reveal className="mt-8 lg:hidden">
          <div className={cn("rounded-2xl border border-border bg-white/[0.03] p-6 text-center")}>
            <p className="text-sm text-stone-400">Still have questions?</p>
            <div className="mt-4">
              <Button href={siteConfig.links.contact} variant="secondary" size="sm">
                Contact Us
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
