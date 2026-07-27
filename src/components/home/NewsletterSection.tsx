"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import type { NewsletterSection } from "@/types/api";
import { siteConfig } from "@/config/site";
import { SectionShell } from "@/components/ui/SectionShell";
import { Button } from "@/components/ui/Button";

interface NewsletterSectionProps {
  content: NewsletterSection;
}

const perks = ["Early collection access", "Atelier drops", "No spam, ever"] as const;

export function NewsletterSectionBlock({ content }: NewsletterSectionProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch(`${siteConfig.apiUrl}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Subscription failed");
      }

      setStatus("success");
      setMessage("Welcome to the atelier list. We will be in touch.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Unable to subscribe right now. Please try again shortly.");
    }
  }

  return (
    <SectionShell tone="default" containerClassName="pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] border border-accent/15 bg-[linear-gradient(135deg,rgba(201,169,98,0.12),rgba(255,255,255,0.02)_45%,rgba(12,10,9,0.9))] p-8 md:p-12"
        >
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
          <div className="absolute inset-x-0 top-0 gold-divider opacity-80" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-center">
            <div className="space-y-6">
              <p className="text-xs uppercase tracking-[0.35em] text-accent">Newsletter</p>
              <h2 className="font-display text-4xl leading-tight text-white md:text-5xl">{content.title}</h2>
              <p className="max-w-xl text-base leading-8 text-stone-400">{content.description}</p>

              <ul className="space-y-3">
                {perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-3 text-sm text-stone-300">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-accent/25 bg-accent/10 text-[10px] text-accent">
                      ✓
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-panel rounded-[1.5rem] p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-[11px] uppercase tracking-[0.24em] text-stone-500">Email address</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    className="h-14 w-full rounded-2xl border border-border bg-stone-950/70 px-5 text-sm text-white outline-none transition focus:border-accent focus:shadow-[0_0_0_4px_rgba(201,169,98,0.12)]"
                  />
                </label>
                <Button type="submit" size="lg" className="w-full" disabled={status === "loading"}>
                  {status === "loading" ? "Joining..." : "Join the Atelier List"}
                </Button>
              </form>

              {message ? (
                <p className={`mt-4 text-sm ${status === "error" ? "text-red-300" : "text-accent"}`}>
                  {message}
                </p>
              ) : (
                <p className="mt-4 text-xs leading-6 text-stone-500">
                  By subscribing you agree to receive updates from Velcraft. Unsubscribe anytime.
                </p>
              )}
            </div>
          </div>
        </motion.div>
    </SectionShell>
  );
}
