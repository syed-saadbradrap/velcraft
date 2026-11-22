"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { AdminAlert, AdminLoading } from "@/components/admin/AdminFeedback";
import {
  AdminPage,
  AdminPageHeader,
  AdminPanel,
  AdminSectionTitle,
} from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getErrorMessage } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import { isEditablePageKey, PAGE_META } from "@/lib/admin/page-meta";
import { cn } from "@/lib/utils";
import type { AdminPageSection } from "@/types/commerce";

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-700">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-border bg-white px-5 py-4 text-base text-stone-900 shadow-sm outline-none transition focus:border-accent"
      />
      {hint ? <span className="block text-xs text-stone-500">{hint}</span> : null}
    </label>
  );
}

function sectionLabel(pageKey: string, sectionKey: string) {
  if (!isEditablePageKey(pageKey)) return sectionKey;
  return PAGE_META[pageKey].sections[sectionKey]?.title ?? sectionKey.replaceAll("_", " ");
}

function sectionHint(pageKey: string, sectionKey: string) {
  if (!isEditablePageKey(pageKey)) return "";
  return PAGE_META[pageKey].sections[sectionKey]?.hint ?? "";
}

export default function AdminPageSectionsEditor() {
  const params = useParams<{ pageKey: string }>();
  const pageKey = params.pageKey;
  const meta = isEditablePageKey(pageKey) ? PAGE_META[pageKey] : null;

  const [sections, setSections] = useState<AdminPageSection[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [dirtyIds, setDirtyIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!meta) {
      setError("Unknown page.");
      setLoading(false);
      return;
    }

    setLoading(true);
    void apiClient
      .getAdminPageSections(pageKey)
      .then((data) => {
        setSections(data);
        setActiveId(data[0]?.id ?? null);
        setDirtyIds(new Set());
        setError("");
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [pageKey, meta]);

  const active = useMemo(
    () => sections.find((section) => section.id === activeId) ?? sections[0] ?? null,
    [sections, activeId],
  );

  function patchActive(patch: Partial<AdminPageSection>) {
    if (!active) return;
    setSections((current) =>
      current.map((row) => (row.id === active.id ? { ...row, ...patch } : row)),
    );
    setDirtyIds((current) => new Set(current).add(active.id));
    setFeedback("");
  }

  async function saveSection(section: AdminPageSection) {
    setSavingId(section.id);
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
        is_active: section.is_active,
      });
      setSections((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      setDirtyIds((current) => {
        const next = new Set(current);
        next.delete(section.id);
        return next;
      });
      setFeedback(`Saved “${sectionLabel(pageKey, section.section_key)}”.`);
    } catch (err) {
      setError(getErrorMessage(err, "Save failed."));
    } finally {
      setSavingId(null);
    }
  }

  async function uploadImage(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file || !active) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = await apiClient.uploadAdminImage(file, "pages");
      patchActive({ image_path: uploaded.path });
      setFeedback("Image uploaded — click Save to publish.");
    } catch (err) {
      setError(getErrorMessage(err, "Image upload failed."));
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <AdminPage>
        <AdminLoading />
      </AdminPage>
    );
  }

  if (!meta) {
    return (
      <AdminPage>
        <AdminAlert message="Unknown page." />
        <Link href="/admin/content" className="mt-4 inline-block text-sm text-accent">
          ← Back to content
        </Link>
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <div className="mb-4">
        <Link
          href="/admin/content"
          className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 transition hover:text-accent"
        >
          ← All pages
        </Link>
      </div>

      <AdminPageHeader
        eyebrow="Page editor"
        title={meta.title}
        description={meta.description}
        action={
          <a
            href={meta.previewPath}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center rounded-full border border-border px-5 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700 transition hover:border-accent/40 hover:text-accent"
          >
            Preview page ↗
          </a>
        }
      />

      {error ? (
        <div className="mt-6">
          <AdminAlert message={error} />
        </div>
      ) : null}
      {feedback ? <p className="mt-4 text-sm text-accent">{feedback}</p> : null}

      {sections.length === 0 ? (
        <AdminPanel className="mt-8">
          <p className="text-sm text-stone-600">
            No sections found for this page yet. Run the CMS bootstrap seeder on the API, then refresh.
          </p>
        </AdminPanel>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_280px]">
          <AdminPanel padding="sm" className="h-fit lg:sticky lg:top-24">
            <p className="mb-3 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
              Sections
            </p>
            <div className="space-y-1">
              {sections.map((section) => {
                const selected = section.id === active?.id;
                const dirty = dirtyIds.has(section.id);
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveId(section.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition",
                      selected
                        ? "bg-stone-900 text-white"
                        : "text-stone-700 hover:bg-stone-100",
                    )}
                  >
                    <span>
                      <span className="block text-sm font-medium">
                        {sectionLabel(pageKey, section.section_key)}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block text-[10px] uppercase tracking-[0.14em]",
                          selected ? "text-white/60" : "text-stone-400",
                        )}
                      >
                        {section.section_key}
                      </span>
                    </span>
                    {dirty ? (
                      <span
                        className={cn(
                          "ml-2 h-2 w-2 rounded-full",
                          selected ? "bg-accent" : "bg-amber-500",
                        )}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </AdminPanel>

          {active ? (
            <AdminPanel className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-5">
                <div>
                  <AdminSectionTitle title={sectionLabel(pageKey, active.section_key)} />
                  <p className="-mt-2 text-sm text-stone-500">
                    {sectionHint(pageKey, active.section_key)}
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs uppercase tracking-[0.14em] text-stone-600">
                  <input
                    type="checkbox"
                    checked={active.is_active}
                    onChange={(event) => patchActive({ is_active: event.target.checked })}
                  />
                  Visible
                </label>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="Eyebrow"
                  value={active.eyebrow ?? ""}
                  onChange={(event) => patchActive({ eyebrow: event.target.value })}
                  placeholder="Small label above the title"
                />
                <Input
                  label="Title"
                  value={active.title ?? ""}
                  onChange={(event) => patchActive({ title: event.target.value })}
                  placeholder="Main heading"
                />
              </div>

              <TextArea
                label="Description"
                value={active.description ?? ""}
                onChange={(value) => patchActive({ description: value })}
                rows={5}
                hint="Shown under the title on the live page."
              />

              <div className="grid gap-5 md:grid-cols-2">
                <Input
                  label="Button label"
                  value={active.cta_label ?? ""}
                  onChange={(event) => patchActive({ cta_label: event.target.value })}
                  placeholder="e.g. Start Designing"
                />
                <Input
                  label="Button link"
                  value={active.cta_url ?? ""}
                  onChange={(event) => patchActive({ cta_url: event.target.value })}
                  placeholder="/customize/studio-loafer"
                />
              </div>

              <div className="space-y-3 rounded-[1.25rem] border border-dashed border-border bg-stone-50/80 p-4">
                <Input
                  label="Image path"
                  value={active.image_path ?? ""}
                  onChange={(event) => patchActive({ image_path: event.target.value })}
                  placeholder="images/pages/...."
                />
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(event) => void uploadImage(event.target.files)}
                    />
                    <span className="inline-flex h-11 items-center rounded-full border border-border bg-white px-5 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700">
                      {uploading ? "Uploading…" : "Upload image"}
                    </span>
                  </label>
                  {active.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={active.image_url}
                      alt=""
                      className="h-14 w-20 rounded-xl border border-border object-cover"
                    />
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
                <Button
                  type="button"
                  disabled={savingId === active.id || !dirtyIds.has(active.id)}
                  onClick={() => void saveSection(active)}
                >
                  {savingId === active.id ? "Saving…" : "Save changes"}
                </Button>
                {dirtyIds.has(active.id) ? (
                  <span className="text-xs uppercase tracking-[0.16em] text-amber-700">
                    Unsaved changes
                  </span>
                ) : (
                  <span className="text-xs uppercase tracking-[0.16em] text-stone-400">Up to date</span>
                )}
              </div>
            </AdminPanel>
          ) : null}

          {active ? (
            <AdminPanel padding="sm" className="hidden h-fit xl:block xl:sticky xl:top-24">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                Live preview
              </p>
              <div className="mt-4 space-y-3 rounded-[1.25rem] bg-stone-50 p-4">
                {active.eyebrow ? (
                  <p className="text-[10px] uppercase tracking-[0.22em] text-accent">{active.eyebrow}</p>
                ) : null}
                <p className="font-display text-2xl leading-tight text-stone-900">
                  {active.title || "Untitled section"}
                </p>
                {active.description ? (
                  <p className="text-sm leading-6 text-stone-600">{active.description}</p>
                ) : (
                  <p className="text-sm text-stone-400">No description yet.</p>
                )}
                {active.cta_label ? (
                  <span className="inline-flex rounded-full bg-stone-900 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-white">
                    {active.cta_label}
                  </span>
                ) : null}
              </div>
              <p className="mt-4 text-xs leading-5 text-stone-500">
                This is a quick text preview. Use “Preview page” to see the real storefront layout.
              </p>
            </AdminPanel>
          ) : null}
        </div>
      )}
    </AdminPage>
  );
}
