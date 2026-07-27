"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Which Velcraft styles can I customize?",
    answer:
      "The Ivory Gold Bit Mule is available in our interactive 3D atelier today. The full collection can be shopped with concierge sizing, and additional customizable silhouettes are added seasonally.",
  },
  {
    question: "How long does production and delivery take?",
    answer:
      "Standard atelier pairs are hand-finished and delivered within 10–14 business days. Custom configurations may require a short additional window depending on material selection.",
  },
  {
    question: "What sizing do you offer?",
    answer:
      "We offer EU sizing for both men and women. Concierge support is available if you need guidance translating your usual size or prefer a bespoke fit consultation.",
  },
  {
    question: "How does the 3D atelier preview work?",
    answer:
      "Inside the atelier studio you can adjust materials, hardware, sole color, and size while viewing a live 3D render of your mule. Changes update instantly before you place your order.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept secure card payments via Stripe, bank transfer, and cash on delivery in supported regions. All transactions are handled with encrypted checkout.",
  },
  {
    question: "Can I return or exchange my order?",
    answer:
      "Unworn pairs in original condition may be returned within 14 days of delivery. Custom atelier orders are made to your specification and are eligible for size exchange subject to concierge review.",
  },
] as const;

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

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative border-y border-border py-24 md:py-28">
      <div className="absolute inset-0 section-glow" />
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
          <Reveal className="lg:sticky lg:top-28">
            <SectionHeading
              eyebrow="FAQ"
              title="Questions our clients ask before entering the atelier"
              description="Everything you need to know about sizing, customization, delivery, and concierge support."
            />
            <div className="mt-8 hidden rounded-2xl border border-border bg-white/[0.03] p-6 lg:block">
              <p className="text-xs uppercase tracking-[0.28em] text-accent">Need more help?</p>
              <p className="mt-3 text-sm leading-7 text-stone-400">
                Our concierge team is available Mon–Sat, 10:00–19:00.
              </p>
              <p className="mt-2 text-sm text-stone-300">{siteConfig.contact.email}</p>
              <div className="mt-5">
                <Button href={siteConfig.links.contact} variant="secondary" size="sm">
                  Contact Concierge
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
                Contact Concierge
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
