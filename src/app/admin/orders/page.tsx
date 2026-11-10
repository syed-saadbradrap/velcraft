"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminBadge, orderStatusTone, paymentStatusTone } from "@/components/admin/AdminBadge";
import { AdminAlert, AdminEmptyState, AdminLoading } from "@/components/admin/AdminFeedback";
import { AdminFilterPills } from "@/components/admin/AdminTable";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";
import { AdminTable, AdminTableCell, AdminTableHead, AdminTableRow } from "@/components/admin/AdminTable";
import { getErrorMessage } from "@/lib/api/auth-client";
import { getAdminListItems } from "@/lib/admin/list-items";
import { apiClient } from "@/lib/api/client";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types/commerce";

const statuses: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    void apiClient
      .getAdminOrders(statusFilter ? { status: statusFilter } : undefined)
      .then((response) => {
        setOrders(getAdminListItems(response));
        setError("");
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
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
    <AdminPage>
      <AdminPageHeader title="Orders" description="Track payments, update fulfillment status, and manage the order queue." />

      <div className="mt-8 space-y-6">
        <AdminFilterPills options={statuses} value={statusFilter} onChange={setStatusFilter} />
        {error ? <AdminAlert message={error} /> : null}
        {loading ? <AdminLoading label="Loading orders..." /> : null}
        {!loading && orders.length === 0 ? (
          <AdminEmptyState title="No orders found" description="Orders will appear here once customers checkout." />
        ) : null}

        {!loading && orders.length > 0 ? (
          <AdminTable>
            <AdminTableHead>
              <AdminTableRow>
                <AdminTableCell header>Order</AdminTableCell>
                <AdminTableCell header>Total</AdminTableCell>
                <AdminTableCell header>Payment</AdminTableCell>
                <AdminTableCell header>Status</AdminTableCell>
                <AdminTableCell header>Actions</AdminTableCell>
              </AdminTableRow>
            </AdminTableHead>
            <tbody>
              {orders.map((order) => (
                <AdminTableRow key={order.id}>
                  <AdminTableCell>
                    <Link href={`/account/orders/${order.id}`} className="font-medium text-stone-900 hover:text-accent">
                      {order.order_number}
                    </Link>
                    <p className="mt-1 text-xs text-stone-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </AdminTableCell>
                  <AdminTableCell className="font-medium text-accent">{formatPrice(order.total)}</AdminTableCell>
                  <AdminTableCell>
                    <AdminBadge tone={paymentStatusTone(order.payment_status)}>{order.payment_status}</AdminBadge>
                  </AdminTableCell>
                  <AdminTableCell>
                    <AdminBadge tone={orderStatusTone(order.status)}>{order.status}</AdminBadge>
                  </AdminTableCell>
                  <AdminTableCell>
                    <select
                      value={order.status}
                      onChange={(event) => void handleStatusChange(order.id, event.target.value as OrderStatus)}
                      className="rounded-full border border-border bg-stone-50 px-3 py-2 text-sm text-stone-900 outline-none"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </AdminTableCell>
                </AdminTableRow>
              ))}
            </tbody>
          </AdminTable>
        ) : null}
      </div>
    </AdminPage>
  );
}
