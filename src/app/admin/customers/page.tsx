"use client";

import { useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { AdminCustomer } from "@/types/commerce";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiClient
      .getAdminCustomers()
      .then((response) => setCustomers(response.items))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  return (
    <Container className="py-10 lg:py-14">
      <SectionHeading eyebrow="Admin" title="Customers" description="Registered customer accounts." />

      {error ? <p className="mt-6 text-sm text-red-300">{error}</p> : null}

      <div className="mt-8 overflow-x-auto rounded-[1.5rem] border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-100/5 text-xs uppercase tracking-[0.18em] text-stone-600">
            <tr>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Email</th>
              <th className="px-4 py-4">Phone</th>
              <th className="px-4 py-4">Orders</th>
              <th className="px-4 py-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t border-border">
                <td className="px-4 py-4 text-stone-900">{customer.name}</td>
                <td className="px-4 py-4 text-stone-600">{customer.email}</td>
                <td className="px-4 py-4 text-stone-600">{customer.phone ?? "—"}</td>
                <td className="px-4 py-4 text-accent">{customer.orders_count}</td>
                <td className="px-4 py-4 text-stone-600">
                  {new Date(customer.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
