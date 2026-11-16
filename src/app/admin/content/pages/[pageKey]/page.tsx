"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminAlert, AdminLoading } from "@/components/admin/AdminFeedback";
import { AdminPage, AdminPageHeader, AdminPanel } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getErrorMessage } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import type { AdminPageSection } from "@/types/commerce";

const ALLOWED = new Set(["about", "contact", "collection", "customize"]);

export default function AdminPageSectionsEditor() {
  const params = useParams<{ pageKey: string }>();
  const pageKey = params.pageKey;
  const [sections, setSections] = useState<AdminPageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!ALLOWED.has(pageKey)) {
      setError("Unknown page.");
      setLoading(false);
      return;
    }

    void apiClient
      .getAdminPageSections(pageKey)
      .then(setSections)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [pageKey]);

  async function saveSection(section: AdminPageSection) {
    setSaving(true);
    setError("");
    setFeedback("");
    try {
      const updated = await apiClient.updateAdminPageSection(section.id, {
        eyebrow: section.eyebrow,
        title: section.title,
        description: section.description,
        cta_label: section.cta_label,
        cta_url: section.cta_url,
        image_path: section.image_path,
      });
      setSections((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      setFeedback(`Saved ${section.section_key}.`);
    } catch (err) {
      setError(getErrorMessage(err, "Save failed."));
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

  return (
    <AdminPage>
      <AdminPageHeader
        title={`${pageKey} page content`}
        description="These fields sync to the public storefront for this page."
      />
      {error ? <AdminAlert message={error} /> : null}
      {feedback ? <p className="mb-4 text-sm text-accent">{feedback}</p> : null}

      <div className="space-y-4">
        {sections.length === 0 ? (
          <AdminPanel>
            <p className="text-sm text-stone-600">No sections found. Re-run database seed to create defaults.</p>
          </AdminPanel>
        ) : null}
        {sections.map((section) => (
          <AdminPanel key={section.id} className="space-y-3">
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{section.section_key}</p>
            <Input
              label="Eyebrow"
              value={section.eyebrow ?? ""}
              onChange={(e) =>
                setSections((current) =>
                  current.map((row) =>
                    row.id === section.id ? { ...row, eyebrow: e.target.value } : row,
                  ),
                )
              }
            />
            <Input
              label="Title"
              value={section.title ?? ""}
              onChange={(e) =>
                setSections((current) =>
                  current.map((row) =>
                    row.id === section.id ? { ...row, title: e.target.value } : row,
                  ),
                )
              }
            />
            <label className="block space-y-1 text-sm">
              <span className="text-stone-600">Description</span>
              <textarea
                className="min-h-28 w-full rounded-xl border border-border px-3 py-2"
                value={section.description ?? ""}
                onChange={(e) =>
                  setSections((current) =>
                    current.map((row) =>
                      row.id === section.id ? { ...row, description: e.target.value } : row,
                    ),
                  )
                }
              />
            </label>
            <Input
              label="CTA label"
              value={section.cta_label ?? ""}
              onChange={(e) =>
                setSections((current) =>
                  current.map((row) =>
                    row.id === section.id ? { ...row, cta_label: e.target.value } : row,
                  ),
                )
              }
            />
            <Input
              label="CTA URL"
              value={section.cta_url ?? ""}
              onChange={(e) =>
                setSections((current) =>
                  current.map((row) =>
                    row.id === section.id ? { ...row, cta_url: e.target.value } : row,
                  ),
                )
              }
            />
            <Input
              label="Image path"
              value={section.image_path ?? ""}
              onChange={(e) =>
                setSections((current) =>
                  current.map((row) =>
                    row.id === section.id ? { ...row, image_path: e.target.value } : row,
                  ),
                )
              }
            />
            <Button type="button" disabled={saving} onClick={() => void saveSection(section)}>
              Save section
            </Button>
          </AdminPanel>
        ))}
      </div>
    </AdminPage>
  );
}
