"use client";

import { FormEvent, useEffect, useState } from "react";
import { getErrorMessage } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { AdminCoupon } from "@/types/commerce";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    code: "",
    type: "percentage" as AdminCoupon["type"],
    value: "10",
    min_order_amount: "0",
    max_uses: "100",
    is_active: true,
  });

  useEffect(() => {
    void apiClient
      .getAdminCoupons()
      .then((response) => setCoupons(response.items))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const created = await apiClient.createAdminCoupon({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        min_order_amount: Number(form.min_order_amount),
        max_uses: Number(form.max_uses),
        is_active: form.is_active,
        expires_at: null,
      });
      setCoupons((current) => [created, ...current]);
      setForm({
        code: "",
        type: "percentage",
        value: "10",
        min_order_amount: "0",
        max_uses: "100",
        is_active: true,
      });
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleToggle(coupon: AdminCoupon) {
    try {
      const updated = await apiClient.updateAdminCoupon(coupon.id, {
        is_active: !coupon.is_active,
      });
      setCoupons((current) => current.map((item) => (item.id === coupon.id ? updated : item)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Container className="py-10 lg:py-14">
      <SectionHeading eyebrow="Admin" title="Coupons" description="Create and manage promotional codes." />

      <form onSubmit={handleCreate} className="glass-panel mt-8 grid gap-4 rounded-[1.5rem] p-6 sm:grid-cols-2">
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
          required
          value={form.value}
          onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))}
        />
        <Input
          label="Min Order Amount"
          name="min_order_amount"
          type="number"
          value={form.min_order_amount}
          onChange={(event) => setForm((current) => ({ ...current, min_order_amount: event.target.value }))}
        />
        <Input
          label="Max Uses"
          name="max_uses"
          type="number"
          value={form.max_uses}
          onChange={(event) => setForm((current) => ({ ...current, max_uses: event.target.value }))}
        />
        <div className="flex items-end">
          <Button type="submit">Create Coupon</Button>
        </div>
      </form>

      {error ? <p className="mt-6 text-sm text-red-300">{error}</p> : null}

      <div className="mt-8 overflow-x-auto rounded-[1.5rem] border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-100/5 text-xs uppercase tracking-[0.18em] text-stone-600">
            <tr>
              <th className="px-4 py-4">Code</th>
              <th className="px-4 py-4">Type</th>
              <th className="px-4 py-4">Value</th>
              <th className="px-4 py-4">Uses</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-t border-border">
                <td className="px-4 py-4 font-medium text-stone-900">{coupon.code}</td>
                <td className="px-4 py-4 capitalize text-stone-600">{coupon.type}</td>
                <td className="px-4 py-4 text-accent">{coupon.value}</td>
                <td className="px-4 py-4 text-stone-600">
                  {coupon.used_count} / {coupon.max_uses}
                </td>
                <td className="px-4 py-4 text-stone-600">{coupon.is_active ? "Active" : "Inactive"}</td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => void handleToggle(coupon)}
                    className="text-sm text-accent hover:underline"
                  >
                    {coupon.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
