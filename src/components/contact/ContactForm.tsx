"use client";

import { FormEvent, useState } from "react";
import type { ContactPageContent } from "@/types/api";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface ContactFormProps {
  content: ContactPageContent;
}

export function ContactForm({ content }: ContactFormProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    try {
      const message = await apiClient.submitContact(form);
      setStatus("success");
      setFeedback(message);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "Unable to send message.");
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="glass-panel rounded-[1.75rem] p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-accent">Concierge</p>
        <h2 className="mt-4 font-display text-4xl text-white">{content.title}</h2>
        <p className="mt-4 text-sm leading-7 text-stone-400">{content.description}</p>

        <dl className="mt-8 space-y-5 text-sm">
          <div>
            <dt className="uppercase tracking-[0.22em] text-stone-500">Email</dt>
            <dd className="mt-2 text-white">{content.email}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.22em] text-stone-500">Phone</dt>
            <dd className="mt-2 text-white">{content.phone}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.22em] text-stone-500">Hours</dt>
            <dd className="mt-2 text-white">{content.hours}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.22em] text-stone-500">Atelier</dt>
            <dd className="mt-2 text-white">{content.address}</dd>
          </div>
        </dl>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel space-y-5 rounded-[1.75rem] p-8">
        <Input
          label="Name"
          name="name"
          required
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
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

        <Button type="submit" size="lg" disabled={status === "loading"}>
          {status === "loading" ? "Sending..." : "Send Message"}
        </Button>

        {feedback ? (
          <p className={`text-sm ${status === "error" ? "text-red-300" : "text-accent"}`}>
            {feedback}
          </p>
        ) : null}
      </form>
    </div>
  );
}
