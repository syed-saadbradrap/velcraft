"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

interface FaqEntry {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faqs: readonly FaqEntry[];
  eyebrow?: string;
  title?: string;
  description?: string;
  showSidebar?: boolean;
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
        className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left transition hover:bg-stone-100/[0.02]"
      >
        <span className="font-display text-xl text-stone-900 md:text-2xl">{question}</span>
        <motion.span
          animate={{ rotate: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/25 text-lg leading-none text-accent"
          aria-hidden
        >
          {open ? "−" : "+"}
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
            <p className="border-t border-border px-6 pb-5 pt-4 text-sm leading-7 text-stone-600 md:text-base md:leading-8">
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
  eyebrow,
  title = "Frequently Asked Questions",
  description,
  showSidebar = true,
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative border-y border-border py-14 md:py-20">
      <div className="absolute inset-0 section-glow" />
      <Container className="relative">
        <div
          className={
            showSidebar
              ? "grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16"
              : "mx-auto max-w-4xl space-y-10"
          }
        >
          <Reveal className={showSidebar ? "lg:sticky lg:top-28" : undefined}>
            <SectionHeading
              eyebrow={eyebrow}
              title={title}
              description={description}
              align={showSidebar ? "left" : "center"}
            />
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
      </Container>
    </section>
  );
}
