"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { ContactMessage } from "@/types/commerce";

const statuses: ContactMessage["status"][] = ["new", "read", "replied", "archived"];

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiClient
      .getAdminContactMessages()
      .then((response) => setMessages(response.items))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  async function handleStatusChange(id: number, status: ContactMessage["status"]) {
    try {
      const updated = await apiClient.updateAdminContactMessage(id, status);
      setMessages((current) => current.map((message) => (message.id === id ? updated : message)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Container className="py-10 lg:py-14">
      <SectionHeading eyebrow="Admin" title="Contact Messages" description="Concierge inbox and follow-ups." />

      {error ? <p className="mt-6 text-sm text-red-300">{error}</p> : null}

      <div className="mt-8 space-y-4">
        {messages.map((message) => (
          <article key={message.id} className="glass-panel rounded-[1.5rem] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                  {new Date(message.created_at).toLocaleString()}
                </p>
                <h2 className="mt-2 font-display text-2xl text-white">{message.subject || "No subject"}</h2>
                <p className="mt-2 text-sm text-stone-400">
                  {message.name} · {message.email}
                </p>
                <p className="mt-4 text-sm leading-7 text-stone-300">{message.message}</p>
              </div>
              <select
                value={message.status}
                onChange={(event) =>
                  void handleStatusChange(message.id, event.target.value as ContactMessage["status"])
                }
                className="rounded-full border border-border bg-stone-950 px-3 py-2 text-sm capitalize text-white outline-none"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </article>
        ))}
      </div>
    </Container>
  );
}
