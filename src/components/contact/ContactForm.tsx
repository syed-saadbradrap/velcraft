"use client";

import { FormEvent, useState } from "react";
import type { ContactPageContent } from "@/types/api";
import { apiClient } from "@/lib/api/client";
import { contactContent } from "@/lib/content/velcraft";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Reveal } from "@/components/motion/Reveal";

interface ContactFormProps {
  content: ContactPageContent;
}

export function ContactForm({ content }: ContactFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const messageBody = form.phone.trim()
      ? `Phone: ${form.phone.trim()}\n\n${form.message}`
      : form.message;

    try {
      const message = await apiClient.submitContact({
        name: form.name,
        email: form.email,
        subject: form.subject,
        message: messageBody,
      });
      setStatus("success");
      setFeedback(message);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "Unable to send message.");
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
      <Reveal className="space-y-6">
        <div className="glass-panel rounded-[1.75rem] p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-accent">{contactContent.info.sectionTitle}</p>
          <h2 className="mt-4 font-display text-3xl text-white md:text-4xl">{contactContent.info.title}</h2>
          <p className="mt-4 text-sm leading-7 text-stone-400">{contactContent.info.description}</p>

          <dl className="mt-8 space-y-6 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Email</dt>
              <dd className="mt-2">
                <a href={`mailto:${content.email}`} className="text-white transition hover:text-accent">
                  {content.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Phone</dt>
              <dd className="mt-2">
                <a href={`tel:${content.phone.replace(/\s/g, "")}`} className="text-white transition hover:text-accent">
                  {content.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Business Hours</dt>
              <dd className="mt-2 text-white">{content.hours}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Address</dt>
              <dd className="mt-2 text-white">{content.address}</dd>
            </div>
          </dl>
        </div>

        <div className="glass-panel rounded-[1.75rem] p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-accent">FAQ</p>
          <h3 className="mt-3 font-display text-2xl text-white">{contactContent.faqPrompt.title}</h3>
          <p className="mt-3 text-sm leading-7 text-stone-400">{contactContent.faqPrompt.description}</p>
          <div className="mt-6">
            <Button href={contactContent.faqPrompt.ctaHref} variant="secondary" size="sm">
              {contactContent.faqPrompt.ctaLabel}
            </Button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <form onSubmit={handleSubmit} className="glass-panel space-y-5 rounded-[1.75rem] p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-accent">Message</p>
            <h2 className="mt-3 font-display text-3xl text-white">{contactContent.form.title}</h2>
            <p className="mt-3 text-sm leading-7 text-stone-400">{contactContent.form.description}</p>
          </div>

          <Input
            label="Full Name"
            name="name"
            required
            autoComplete="name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
          />
          <Input
            label="Subject"
            name="subject"
            value={form.subject}
            onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
          />
          <Textarea
            label="Message"
            name="message"
            required
            value={form.message}
            onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
          />

          <Button type="submit" size="lg" className="w-full" disabled={status === "loading"}>
            {status === "loading" ? "Sending..." : contactContent.form.submitLabel}
          </Button>

          {feedback ? (
            <p className={`text-sm ${status === "error" ? "text-red-300" : "text-accent"}`}>{feedback}</p>
          ) : null}
        </form>
      </Reveal>
    </div>
  );
}
