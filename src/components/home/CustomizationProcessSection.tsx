"use client";

import { motion } from "framer-motion";
import type { ProcessStep } from "@/types/api";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionShell } from "@/components/ui/SectionShell";

const stepMeta: Record<string, { number: string; label: string }> = {
  shoe: { number: "01", label: "Silhouette" },
  palette: { number: "02", label: "Configuration" },
  truck: { number: "03", label: "Delivery" },
};

function StepIcon({ icon }: { icon?: string | null }) {
  if (icon === "palette") {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 3c-4.5 0-8 3.2-8 7.5 0 2.2 1 4.1 2.6 5.4.8.7 1.2 1.7 1.2 2.7V20a1 1 0 001 1h6a1 1 0 001-1v-1.4c0-1 .4-2 1.2-2.7 1.6-1.3 2.6-3.2 2.6-5.4C18 6.2 14.5 3 12 3z" />
        <circle cx="8.5" cy="10" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
        <circle cx="15.5" cy="10" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (icon === "truck") {
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

interface CustomizationProcessSectionProps {
  steps: ProcessStep[];
}

export function CustomizationProcessSection({ steps }: CustomizationProcessSectionProps) {
  return (
    <SectionShell tone="default" containerClassName="space-y-14">
      <SectionHeading
        eyebrow="The Process"
        title="From concept to crafted pair in three refined steps"
        description="Our workflow mirrors a private atelier consultation — intuitive online, meticulous in production."
        align="center"
      />

      <div className="relative grid gap-6 md:grid-cols-3">
        <div className="pointer-events-none absolute left-[16.5%] right-[16.5%] top-12 hidden h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent md:block" />

        {steps.map((step, index) => {
          const meta = stepMeta[step.icon ?? ""] ?? {
            number: String(index + 1).padStart(2, "0"),
            label: "Step",
          };

          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className="glass-panel glass-panel-hover relative flex h-full min-h-[280px] flex-col rounded-[1.75rem] p-8"
            >
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10">
                  <StepIcon icon={step.icon} />
                </div>
                <div className="text-right">
                  <p className="font-display text-3xl text-accent/80">{meta.number}</p>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">{meta.label}</p>
                </div>
              </div>

              <h3 className="font-display text-2xl text-white md:text-3xl">{step.title}</h3>
              <p className="mt-4 flex-1 text-sm leading-7 text-stone-400">{step.description}</p>
            </motion.div>
          );
        })}
      </div>
    </SectionShell>
  );
}
