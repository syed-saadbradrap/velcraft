"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminBadge, orderStatusTone, paymentStatusTone } from "@/components/admin/AdminBadge";
import { AdminAlert, AdminLoading } from "@/components/admin/AdminFeedback";
import { AdminPage, AdminPageHeader, AdminPanel, AdminSectionTitle, AdminStatCard } from "@/components/admin/AdminPage";
import { AdminTable, AdminTableCell, AdminTableHead, AdminTableRow } from "@/components/admin/AdminTable";
import { getErrorMessage } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import { formatPrice } from "@/lib/utils";
import type { AdminDashboard } from "@/types/commerce";

const quickActions = [
  { label: "Add Product", href: "/admin/products/new", hint: "Create catalog item" },
  { label: "Manage Orders", href: "/admin/orders", hint: "Update fulfillment" },
  { label: "View Messages", href: "/admin/contact-messages", hint: "Reply to customers" },
  { label: "Create Coupon", href: "/admin/coupons", hint: "Launch promotion" },
];

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiClient
      .getAdminDashboard()
      .then((data) => {
        setDashboard(data);
        setError("");
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminPage>
      <AdminPageHeader
        title="Dashboard"
        description="A live overview of revenue, orders, catalog health, and customer activity."
      />

      <div className="mt-8 space-y-8">
        {error ? <AdminAlert message={error} /> : null}
        {loading ? <AdminLoading label="Loading dashboard overview..." /> : null}

        {dashboard ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <AdminStatCard label="Total Revenue" value={formatPrice(dashboard.revenue.total)} hint="All paid orders" accent />
              <AdminStatCard
                label="This Month"
                value={formatPrice(dashboard.revenue.month)}
                hint="Paid orders this month"
              />
              <AdminStatCard label="Total Orders" value={dashboard.orders.total} hint={`${dashboard.orders.pending} pending`} />
              <AdminStatCard label="Customers" value={dashboard.customers} hint="Registered accounts" />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <AdminStatCard label="Processing" value={dashboard.orders.processing} />
              <AdminStatCard label="Shipped" value={dashboard.orders.shipped} />
              <AdminStatCard label="Delivered" value={dashboard.orders.delivered} />
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
              <AdminStatCard
                label="Products"
                value={dashboard.shoes}
                hint={`${dashboard.active_shoes} active on storefront`}
              />
              <AdminStatCard
                label="Coupons"
                value={dashboard.coupons.active}
                hint={`${dashboard.coupons.total} total codes`}
              />
              <AdminStatCard
                label="New Messages"
                value={dashboard.contact_messages.new}
                hint={`${dashboard.contact_messages.total} in inbox`}
                accent
              />
              <AdminStatCard label="Pending Orders" value={dashboard.orders.pending} accent />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <AdminPanel>
                <AdminSectionTitle
                  title="Recent Orders"
                  action={
                    <Link href="/admin/orders" className="text-xs uppercase tracking-[0.16em] text-accent hover:underline">
                      View all
                    </Link>
                  }
                />
                {dashboard.recent_orders.length === 0 ? (
                  <p className="text-sm text-stone-600">No orders yet.</p>
                ) : (
                  <AdminTable className="border-0 shadow-none">
                    <AdminTableHead>
                      <AdminTableRow>
                        <AdminTableCell header>Order</AdminTableCell>
                        <AdminTableCell header>Customer</AdminTableCell>
                        <AdminTableCell header>Total</AdminTableCell>
                        <AdminTableCell header>Status</AdminTableCell>
                      </AdminTableRow>
                    </AdminTableHead>
                    <tbody>
                      {dashboard.recent_orders.map((order) => (
                        <AdminTableRow key={order.id}>
                          <AdminTableCell>
                            <Link href="/admin/orders" className="font-medium text-stone-900 hover:text-accent">
                              {order.order_number}
                            </Link>
                            <p className="mt-1 text-xs text-stone-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </AdminTableCell>
                          <AdminTableCell className="text-stone-600">{order.customer_name}</AdminTableCell>
                          <AdminTableCell className="font-medium text-accent">{formatPrice(order.total)}</AdminTableCell>
                          <AdminTableCell>
                            <div className="flex flex-wrap gap-2">
                              <AdminBadge tone={orderStatusTone(order.status)}>{order.status}</AdminBadge>
                              <AdminBadge tone={paymentStatusTone(order.payment_status)}>{order.payment_status}</AdminBadge>
                            </div>
                          </AdminTableCell>
                        </AdminTableRow>
                      ))}
                    </tbody>
                  </AdminTable>
                )}
              </AdminPanel>

              <div className="space-y-6">
                <AdminPanel>
                  <AdminSectionTitle
                    title="Recent Messages"
                    action={
                      <Link href="/admin/contact-messages" className="text-xs uppercase tracking-[0.16em] text-accent hover:underline">
                        Open inbox
                      </Link>
                    }
                  />
                  {dashboard.recent_messages.length === 0 ? (
                    <p className="text-sm text-stone-600">No messages yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {dashboard.recent_messages.map((message) => (
                        <div key={message.id} className="rounded-2xl border border-border bg-stone-50/70 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-stone-900">{message.subject || "No subject"}</p>
                              <p className="mt-1 text-xs text-stone-500">
                                {message.name} · {message.email}
                              </p>
                            </div>
                            <AdminBadge tone={message.status === "new" ? "warning" : "neutral"}>{message.status}</AdminBadge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </AdminPanel>

                <AdminPanel>
                  <AdminSectionTitle title="Quick Actions" />
                  <div className="grid gap-3 sm:grid-cols-2">
                    {quickActions.map((action) => (
                      <Link
                        key={action.href}
                        href={action.href}
                        className="rounded-2xl border border-border bg-stone-50/70 p-4 transition hover:border-accent/30 hover:bg-accent/5"
                      >
                        <p className="text-sm font-medium text-stone-900">{action.label}</p>
                        <p className="mt-1 text-xs text-stone-500">{action.hint}</p>
                      </Link>
                    ))}
                  </div>
                </AdminPanel>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </AdminPage>
  );
}
