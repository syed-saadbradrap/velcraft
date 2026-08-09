"use client";

import { useEffect, useState } from "react";
import { AdminBadge, messageStatusTone } from "@/components/admin/AdminBadge";
import { AdminAlert, AdminEmptyState, AdminLoading } from "@/components/admin/AdminFeedback";
import { AdminPage, AdminPageHeader, AdminPanel } from "@/components/admin/AdminPage";
import { AdminFilterPills } from "@/components/admin/AdminTable";
import { getErrorMessage } from "@/lib/api/auth-client";
import { getAdminListItems } from "@/lib/admin/list-items";
import { apiClient } from "@/lib/api/client";
import type { ContactMessage } from "@/types/commerce";

const statuses: ContactMessage["status"][] = ["new", "read", "replied", "archived"];

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [statusFilter, setStatusFilter] = useState<ContactMessage["status"] | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    void apiClient
      .getAdminContactMessages(statusFilter ? { status: statusFilter } : undefined)
      .then((response) => {
        setMessages(getAdminListItems(response));
        setError("");
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  async function handleStatusChange(id: number, status: ContactMessage["status"]) {
    try {
      const updated = await apiClient.updateAdminContactMessage(id, status);
      setMessages((current) => current.map((message) => (message.id === id ? updated : message)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <AdminPage>
      <AdminPageHeader title="Contact Messages" description="Concierge inbox for customer inquiries and follow-ups." />

      <div className="mt-8 space-y-6">
        <AdminFilterPills options={statuses} value={statusFilter} onChange={setStatusFilter} />
        {error ? <AdminAlert message={error} /> : null}
        {loading ? <AdminLoading label="Loading messages..." /> : null}
        {!loading && messages.length === 0 ? (
          <AdminEmptyState title="No messages yet" description="Contact form submissions will appear here." />
        ) : null}

        <div className="space-y-4">
          {messages.map((message) => (
            <AdminPanel key={message.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <AdminBadge tone={messageStatusTone(message.status)}>{message.status}</AdminBadge>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone-500">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                  <h2 className="mt-3 font-display text-2xl text-stone-900">{message.subject || "No subject"}</h2>
                  <p className="mt-2 text-sm text-stone-700">
                    {message.name} · {message.email}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-stone-600">{message.message}</p>
                </div>
                <select
                  value={message.status}
                  onChange={(event) =>
                    void handleStatusChange(message.id, event.target.value as ContactMessage["status"])
                  }
                  className="rounded-full border border-border bg-stone-50 px-3 py-2 text-sm capitalize text-stone-900 outline-none"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </AdminPanel>
          ))}
        </div>
      </div>
    </AdminPage>
  );
}
