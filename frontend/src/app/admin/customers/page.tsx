"use client";

import { useEffect, useState } from "react";
import { AdminAlert, AdminEmptyState, AdminLoading } from "@/components/admin/AdminFeedback";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";
import { AdminTable, AdminTableCell, AdminTableHead, AdminTableRow } from "@/components/admin/AdminTable";
import { getErrorMessage } from "@/lib/api/auth-client";
import { getAdminListItems } from "@/lib/admin/list-items";
import { apiClient } from "@/lib/api/client";
import type { AdminCustomer } from "@/types/commerce";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiClient
      .getAdminCustomers()
      .then((response) => {
        setCustomers(getAdminListItems(response));
        setError("");
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminPage>
      <AdminPageHeader title="Customers" description="Registered customer accounts and order activity." />

      <div className="mt-8 space-y-6">
        {error ? <AdminAlert message={error} /> : null}
        {loading ? <AdminLoading label="Loading customers..." /> : null}
        {!loading && customers.length === 0 ? (
          <AdminEmptyState title="No customers yet" description="Customer accounts will appear after registration." />
        ) : null}

        {!loading && customers.length > 0 ? (
          <AdminTable>
            <AdminTableHead>
              <AdminTableRow>
                <AdminTableCell header>Name</AdminTableCell>
                <AdminTableCell header>Email</AdminTableCell>
                <AdminTableCell header>Phone</AdminTableCell>
                <AdminTableCell header>Orders</AdminTableCell>
                <AdminTableCell header>Joined</AdminTableCell>
              </AdminTableRow>
            </AdminTableHead>
            <tbody>
              {customers.map((customer) => (
                <AdminTableRow key={customer.id}>
                  <AdminTableCell className="font-medium text-stone-900">{customer.name}</AdminTableCell>
                  <AdminTableCell className="text-stone-600">{customer.email}</AdminTableCell>
                  <AdminTableCell className="text-stone-600">{customer.phone ?? "—"}</AdminTableCell>
                  <AdminTableCell className="font-medium text-accent">{customer.orders_count}</AdminTableCell>
                  <AdminTableCell className="text-stone-600">
                    {new Date(customer.created_at).toLocaleDateString()}
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
