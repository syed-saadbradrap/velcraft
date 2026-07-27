"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/commerce";

const statuses: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void apiClient
      .getAdminOrders(statusFilter ? { status: statusFilter } : undefined)
      .then((response) => setOrders(response.items))
      .catch((err) => setError(getErrorMessage(err)));
  }, [statusFilter]);

  async function handleStatusChange(orderId: number, status: OrderStatus) {
    try {
      const updated = await apiClient.updateAdminOrderStatus(orderId, status);
      setOrders((current) => current.map((order) => (order.id === orderId ? updated : order)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Container className="py-10 lg:py-14">
      <SectionHeading eyebrow="Admin" title="Orders" description="Manage customer orders and fulfillment." />

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter("")}
          className={`rounded-full border px-4 py-2 text-sm ${statusFilter === "" ? "border-accent text-accent" : "border-border text-stone-400"}`}
        >
          All
        </button>
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-full border px-4 py-2 text-sm capitalize ${statusFilter === status ? "border-accent text-accent" : "border-border text-stone-400"}`}
          >
            {status}
          </button>
        ))}
      </div>

      {error ? <p className="mt-6 text-sm text-red-300">{error}</p> : null}

      <div className="mt-8 overflow-x-auto rounded-[1.5rem] border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.18em] text-stone-500">
            <tr>
              <th className="px-4 py-4">Order</th>
              <th className="px-4 py-4">Total</th>
              <th className="px-4 py-4">Payment</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-border">
                <td className="px-4 py-4">
                  <Link href={`/account/orders/${order.id}`} className="text-white hover:text-accent">
                    {order.order_number}
                  </Link>
                  <p className="mt-1 text-xs text-stone-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </td>
                <td className="px-4 py-4 text-accent">{formatPrice(order.total)}</td>
                <td className="px-4 py-4 capitalize text-stone-300">{order.payment_status}</td>
                <td className="px-4 py-4 capitalize text-stone-300">{order.status}</td>
                <td className="px-4 py-4">
                  <select
                    value={order.status}
                    onChange={(event) =>
                      void handleStatusChange(order.id, event.target.value as OrderStatus)
                    }
                    className="rounded-full border border-border bg-stone-950 px-3 py-2 text-sm text-white outline-none"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
