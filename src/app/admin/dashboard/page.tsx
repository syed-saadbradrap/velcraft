"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatPrice } from "@/lib/utils";
import type { AdminDashboard } from "@/types/commerce";

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiClient
      .getAdminDashboard()
      .then(setDashboard)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  return (
    <Container className="py-10 lg:py-14">
      <SectionHeading
        eyebrow="Admin"
        title="Dashboard"
        description="Overview of orders, customers, and revenue."
      />

      {error ? <p className="mt-6 text-sm text-red-300">{error}</p> : null}

      {dashboard ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Total Orders", value: dashboard.orders.total },
            { label: "Pending Orders", value: dashboard.orders.pending },
            { label: "Customers", value: dashboard.customers },
            { label: "Revenue", value: formatPrice(dashboard.revenue.total) },
          ].map((stat) => (
            <div key={stat.label} className="glass-panel rounded-[1.5rem] p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-stone-500">{stat.label}</p>
              <p className="mt-3 font-display text-3xl text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {dashboard ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="glass-panel rounded-[1.5rem] p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Processing</p>
            <p className="mt-3 font-display text-3xl text-accent">{dashboard.orders.processing}</p>
          </div>
          <div className="glass-panel rounded-[1.5rem] p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Shoes</p>
            <p className="mt-3 font-display text-3xl text-accent">{dashboard.shoes}</p>
          </div>
          <div className="glass-panel rounded-[1.5rem] p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">New Messages</p>
            <p className="mt-3 font-display text-3xl text-accent">
              {dashboard.contact_messages.new} / {dashboard.contact_messages.total}
            </p>
          </div>
        </div>
      ) : null}
    </Container>
  );
}
