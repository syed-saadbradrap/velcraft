"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminAlert, AdminEmptyState, AdminLoading } from "@/components/admin/AdminFeedback";
import { AdminPage, AdminPageHeader, AdminPanel } from "@/components/admin/AdminPage";
import { AdminTable, AdminTableCell, AdminTableHead, AdminTableRow } from "@/components/admin/AdminTable";
import { getErrorMessage } from "@/lib/api/auth-client";
import { getAdminListItems } from "@/lib/admin/list-items";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { AdminCoupon } from "@/types/commerce";

const emptyForm = {
  code: "",
  type: "percentage" as AdminCoupon["type"],
  value: "10",
  min_order_amount: "0",
  max_uses: "100",
  is_active: true,
};

function couponToForm(coupon: AdminCoupon) {
  return {
    code: coupon.code,
    type: coupon.type,
    value: String(coupon.value),
    min_order_amount: String(coupon.min_order_amount ?? 0),
    max_uses: coupon.max_uses != null ? String(coupon.max_uses) : "",
    is_active: coupon.is_active,
  };
}

function formatUses(coupon: AdminCoupon) {
  const used = coupon.used_count ?? 0;
  const max = coupon.max_uses;

  if (max == null) {
    return `${used} / Unlimited`;
  }

  return `${used} / ${max}`;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    void apiClient
      .getAdminCoupons()
      .then((response) => {
        setCoupons(getAdminListItems(response));
        setError("");
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  function startEdit(coupon: AdminCoupon) {
    setEditingId(coupon.id);
    setForm(couponToForm(coupon));
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      code: form.code.trim(),
      type: form.type,
      value: Number(form.value),
      min_order_amount: Number(form.min_order_amount),
      max_uses: form.max_uses.trim() ? Number(form.max_uses) : null,
      is_active: form.is_active,
      expires_at: null,
    };

    try {
      if (editingId) {
        const updated = await apiClient.updateAdminCoupon(editingId, payload);
        setCoupons((current) => current.map((item) => (item.id === editingId ? updated : item)));
      } else {
        const created = await apiClient.createAdminCoupon(payload);
        setCoupons((current) => [created, ...current]);
      }

      resetForm();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(coupon: AdminCoupon) {
    try {
      const updated = await apiClient.updateAdminCoupon(coupon.id, {
        is_active: !coupon.is_active,
      });
      setCoupons((current) => current.map((item) => (item.id === coupon.id ? updated : item)));

      if (editingId === coupon.id) {
        setForm((current) => ({ ...current, is_active: updated.is_active }));
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDelete(coupon: AdminCoupon) {
    if (!window.confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) {
      return;
    }

    try {
      await apiClient.deleteAdminCoupon(coupon.id);
      setCoupons((current) => current.filter((item) => item.id !== coupon.id));

      if (editingId === coupon.id) {
        resetForm();
      }

      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <AdminPage>
      <AdminPageHeader title="Coupons" description="Create, edit, and manage promotional discount codes." />

      <AdminPanel className="mt-8">
        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-stone-600">
            {editingId ? "Update an existing coupon below." : "Create a new coupon below."}
          </p>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs uppercase tracking-[0.18em] text-stone-600 hover:text-stone-900"
            >
              Cancel Edit
            </button>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Code"
            name="code"
            required
            value={form.code}
            onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
          />
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.28em] text-stone-600">Type</span>
            <select
              value={form.type}
              onChange={(event) =>
                setForm((current) => ({ ...current, type: event.target.value as AdminCoupon["type"] }))
              }
              className="h-14 w-full rounded-2xl border border-border bg-white/80 px-5 text-sm text-stone-900 outline-none"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
          </label>
          <Input
            label="Value"
            name="value"
            type="number"
            min="0"
            required
            value={form.value}
            onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))}
          />
          <Input
            label="Min Order Amount"
            name="min_order_amount"
            type="number"
            min="0"
            value={form.min_order_amount}
            onChange={(event) => setForm((current) => ({ ...current, min_order_amount: event.target.value }))}
          />
          <Input
            label="Max Uses"
            name="max_uses"
            type="number"
            min="1"
            value={form.max_uses}
            placeholder="Leave empty for unlimited"
            onChange={(event) => setForm((current) => ({ ...current, max_uses: event.target.value }))}
          />
          <label className="flex items-center gap-3 self-end rounded-2xl border border-border px-4 py-3">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
            />
            <span className="text-sm text-stone-800">Active coupon</span>
          </label>
        </div>

        <div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update Coupon" : "Create Coupon"}
          </Button>
        </div>
        </form>
      </AdminPanel>

      <div className="mt-6 space-y-6">
      {error ? <AdminAlert message={error} /> : null}
      {loading ? <AdminLoading label="Loading coupons..." /> : null}
      {!loading && coupons.length === 0 ? (
        <AdminEmptyState title="No coupons yet" description="Create your first promotional code above." />
      ) : null}

      {!loading && coupons.length > 0 ? (
        <AdminTable>
          <AdminTableHead>
            <AdminTableRow>
              <AdminTableCell header>Code</AdminTableCell>
              <AdminTableCell header>Type</AdminTableCell>
              <AdminTableCell header>Value</AdminTableCell>
              <AdminTableCell header>Uses</AdminTableCell>
              <AdminTableCell header>Status</AdminTableCell>
              <AdminTableCell header>Actions</AdminTableCell>
            </AdminTableRow>
          </AdminTableHead>
          <tbody>
            {coupons.map((coupon) => (
              <AdminTableRow key={coupon.id} className={editingId === coupon.id ? "bg-accent/5" : undefined}>
                <AdminTableCell className="font-medium text-stone-900">{coupon.code}</AdminTableCell>
                <AdminTableCell className="capitalize text-stone-600">{coupon.type}</AdminTableCell>
                <AdminTableCell className="text-accent">{coupon.value}</AdminTableCell>
                <AdminTableCell className="text-stone-600">{formatUses(coupon)}</AdminTableCell>
                <AdminTableCell>
                  <AdminBadge tone={coupon.is_active ? "success" : "neutral"}>
                    {coupon.is_active ? "Active" : "Inactive"}
                  </AdminBadge>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => startEdit(coupon)} className="text-sm text-accent hover:underline">
                      Edit
                    </button>
                    <button type="button" onClick={() => void handleToggle(coupon)} className="text-sm text-stone-700 hover:underline">
                      {coupon.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button type="button" onClick={() => void handleDelete(coupon)} className="text-sm text-red-600 hover:underline">
                      Delete
                    </button>
                  </div>
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
