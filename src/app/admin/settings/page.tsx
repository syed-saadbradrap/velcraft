"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AdminAlert, AdminLoading } from "@/components/admin/AdminFeedback";
import { AdminPage, AdminPageHeader, AdminPanel } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getErrorMessage } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import type { AdminSiteSettingsMap } from "@/types/commerce";

type TabKey =
  | "brand"
  | "contact"
  | "navigation"
  | "header"
  | "footer"
  | "commerce"
  | "payments"
  | "customize_page"
  | "newsletter";

const TABS: { id: TabKey; label: string }[] = [
  { id: "brand", label: "Brand" },
  { id: "contact", label: "Contact" },
  { id: "navigation", label: "Navigation" },
  { id: "header", label: "Header" },
  { id: "footer", label: "Footer" },
  { id: "commerce", label: "Commerce" },
  { id: "payments", label: "Payments" },
  { id: "customize_page", label: "Customize page" },
  { id: "newsletter", label: "Newsletter" },
];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AdminSiteSettingsMap>({});
  const [tab, setTab] = useState<TabKey>("brand");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    void apiClient
      .getAdminSettings()
      .then((data) => {
        setSettings(data);
        setError("");
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const current = useMemo(() => asRecord(settings[tab]), [settings, tab]);

  function updateField(path: string, value: string) {
    setSettings((prev) => {
      const next = { ...prev };
      const draft = { ...asRecord(next[tab]) };
      const parts = path.split(".");
      if (parts.length === 1) {
        draft[parts[0]] = value;
      } else {
        const [a, b] = parts;
        draft[a] = { ...asRecord(draft[a]), [b]: value };
      }
      next[tab] = draft;
      return next;
    });
  }

  function updateNavItems(raw: string) {
    const items = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, href] = line.split("|").map((part) => part.trim());
        return { label: label || "", href: href || "/" };
      });
    setSettings((prev) => ({ ...prev, navigation: { items } }));
  }

  function updateAnnouncement(raw: string) {
    const announcement_items = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    setSettings((prev) => ({ ...prev, header: { announcement_items } }));
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFeedback("");
    try {
      const updated = await apiClient.updateAdminSetting(tab, asRecord(settings[tab]));
      setSettings((prev) => ({ ...prev, [updated.key]: updated.value }));
      setFeedback("Saved. Storefront will pick this up on the next refresh.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save setting."));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminPage>
        <AdminLoading />
      </AdminPage>
    );
  }

  const navLines = Array.isArray(asRecord(settings.navigation).items)
    ? (asRecord(settings.navigation).items as Array<{ label?: string; href?: string }>)
        .map((item) => `${item.label ?? ""} | ${item.href ?? "/"}`)
        .join("\n")
    : "";

  const announcementLines = Array.isArray(asRecord(settings.header).announcement_items)
    ? (asRecord(settings.header).announcement_items as string[]).join("\n")
    : "";

  return (
    <AdminPage>
      <AdminPageHeader
        title="Site settings"
        description="Brand name, contact details, navigation, footer, payments, and customize page copy."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setTab(item.id);
              setFeedback("");
              setError("");
            }}
            className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em] ${
              tab === item.id
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-border text-stone-600"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <AdminPanel>
        <form className="space-y-4" onSubmit={(event) => void handleSave(event)}>
          {tab === "brand" ? (
            <>
              <Input label="Brand name" value={str(current.name)} onChange={(e) => updateField("name", e.target.value)} />
              <Input label="Tagline" value={str(current.tagline)} onChange={(e) => updateField("tagline", e.target.value)} />
              <label className="block space-y-1 text-sm">
                <span className="text-stone-600">Description</span>
                <textarea
                  className="min-h-24 w-full rounded-xl border border-border px-3 py-2"
                  value={str(current.description)}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </label>
              <Input
                label="Logo path"
                value={str(current.logo_path)}
                onChange={(e) => updateField("logo_path", e.target.value)}
              />
            </>
          ) : null}

          {tab === "contact" ? (
            <>
              <Input label="Email" value={str(current.email)} onChange={(e) => updateField("email", e.target.value)} />
              <Input label="Phone" value={str(current.phone)} onChange={(e) => updateField("phone", e.target.value)} />
              <Input
                label="WhatsApp"
                value={str(current.whatsapp)}
                onChange={(e) => updateField("whatsapp", e.target.value)}
              />
              <Input
                label="WhatsApp message"
                value={str(current.whatsapp_message)}
                onChange={(e) => updateField("whatsapp_message", e.target.value)}
              />
              <Input label="Hours" value={str(current.hours)} onChange={(e) => updateField("hours", e.target.value)} />
              <Input
                label="Address"
                value={str(current.address)}
                onChange={(e) => updateField("address", e.target.value)}
              />
              <Input
                label="Map URL"
                value={str(current.map_url)}
                onChange={(e) => updateField("map_url", e.target.value)}
              />
            </>
          ) : null}

          {tab === "navigation" ? (
            <label className="block space-y-1 text-sm">
              <span className="text-stone-600">Nav items (one per line: Label | /path)</span>
              <textarea
                className="min-h-40 w-full rounded-xl border border-border px-3 py-2 font-mono text-sm"
                value={navLines}
                onChange={(e) => updateNavItems(e.target.value)}
              />
            </label>
          ) : null}

          {tab === "header" ? (
            <label className="block space-y-1 text-sm">
              <span className="text-stone-600">Announcement bar lines (one per line)</span>
              <textarea
                className="min-h-32 w-full rounded-xl border border-border px-3 py-2"
                value={announcementLines}
                onChange={(e) => updateAnnouncement(e.target.value)}
              />
            </label>
          ) : null}

          {tab === "footer" ? (
            <>
              <label className="block space-y-1 text-sm">
                <span className="text-stone-600">Footer blurb</span>
                <textarea
                  className="min-h-24 w-full rounded-xl border border-border px-3 py-2"
                  value={str(current.blurb)}
                  onChange={(e) => updateField("blurb", e.target.value)}
                />
              </label>
            </>
          ) : null}

          {tab === "commerce" ? (
            <>
              <Input
                label="Delivery timeline"
                value={str(current.delivery_timeline)}
                onChange={(e) => updateField("delivery_timeline", e.target.value)}
              />
              <Input
                label="Shipping flat (PKR)"
                value={str(current.shipping_flat, "2500")}
                onChange={(e) => updateField("shipping_flat", e.target.value)}
              />
              <Input
                label="Currency"
                value={str(current.currency, "PKR")}
                onChange={(e) => updateField("currency", e.target.value)}
              />
            </>
          ) : null}

          {tab === "payments" ? (
            <>
              <Input
                label="Bank name"
                value={str(asRecord(current.bank_transfer).bank_name)}
                onChange={(e) => updateField("bank_transfer.bank_name", e.target.value)}
              />
              <Input
                label="Account title"
                value={str(asRecord(current.bank_transfer).account_title)}
                onChange={(e) => updateField("bank_transfer.account_title", e.target.value)}
              />
              <Input
                label="Account number"
                value={str(asRecord(current.bank_transfer).account_number)}
                onChange={(e) => updateField("bank_transfer.account_number", e.target.value)}
              />
              <Input
                label="IBAN"
                value={str(asRecord(current.bank_transfer).iban)}
                onChange={(e) => updateField("bank_transfer.iban", e.target.value)}
              />
            </>
          ) : null}

          {tab === "customize_page" ? (
            <>
              <Input
                label="Eyebrow"
                value={str(current.eyebrow)}
                onChange={(e) => updateField("eyebrow", e.target.value)}
              />
              <Input label="Title" value={str(current.title)} onChange={(e) => updateField("title", e.target.value)} />
              <label className="block space-y-1 text-sm">
                <span className="text-stone-600">Description</span>
                <textarea
                  className="min-h-28 w-full rounded-xl border border-border px-3 py-2"
                  value={str(current.description)}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </label>
            </>
          ) : null}

          {tab === "newsletter" ? (
            <>
              <Input label="Title" value={str(current.title)} onChange={(e) => updateField("title", e.target.value)} />
              <label className="block space-y-1 text-sm">
                <span className="text-stone-600">Description</span>
                <textarea
                  className="min-h-24 w-full rounded-xl border border-border px-3 py-2"
                  value={str(current.description)}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </label>
            </>
          ) : null}

          {error ? <AdminAlert message={error} /> : null}
          {feedback ? <p className="text-sm text-accent">{feedback}</p> : null}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save tab"}
          </Button>
        </form>
      </AdminPanel>
    </AdminPage>
  );
}
