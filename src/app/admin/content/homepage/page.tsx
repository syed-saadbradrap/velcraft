"use client";

import { FormEvent, useEffect, useState } from "react";
import { AdminAlert, AdminLoading } from "@/components/admin/AdminFeedback";
import { AdminPage, AdminPageHeader, AdminPanel } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getErrorMessage } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import type {
  AdminHeroSlide,
  AdminPageSection,
  AdminTestimonialItem,
  AdminWhyChooseItem,
} from "@/types/commerce";

export default function AdminHomepageContentPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [heroSlides, setHeroSlides] = useState<AdminHeroSlide[]>([]);
  const [whyItems, setWhyItems] = useState<AdminWhyChooseItem[]>([]);
  const [testimonials, setTestimonials] = useState<AdminTestimonialItem[]>([]);
  const [sections, setSections] = useState<AdminPageSection[]>([]);
  const [heroForm, setHeroForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    image_path: "",
    cta_label: "",
    cta_url: "",
  });
  const [editingHeroId, setEditingHeroId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  async function reload() {
    const [heroes, why, reviews, pageSections] = await Promise.all([
      apiClient.getAdminHeroSlides(),
      apiClient.getAdminWhyChooseItems(),
      apiClient.getAdminTestimonials(),
      apiClient.getAdminPageSections("home"),
    ]);
    setHeroSlides(heroes);
    setWhyItems(why);
    setTestimonials(reviews);
    setSections(pageSections);
  }

  useEffect(() => {
    void reload()
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function saveHero(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFeedback("");
    try {
      const payload = {
        ...heroForm,
        is_active: true,
        sort_order: editingHeroId
          ? heroSlides.find((item) => item.id === editingHeroId)?.sort_order ?? 1
          : heroSlides.length + 1,
      };
      if (editingHeroId) {
        await apiClient.updateAdminHeroSlide(editingHeroId, payload);
      } else {
        await apiClient.createAdminHeroSlide(payload);
      }
      setEditingHeroId(null);
      setHeroForm({
        title: "",
        subtitle: "",
        description: "",
        image_path: "",
        cta_label: "",
        cta_url: "",
      });
      await reload();
      setFeedback("Hero slide saved.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save hero slide."));
    } finally {
      setSaving(false);
    }
  }

  async function uploadHeroImage(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    try {
      const uploaded = await apiClient.uploadAdminImage(file, "hero");
      setHeroForm((current) => ({ ...current, image_path: uploaded.path }));
    } catch (err) {
      setError(getErrorMessage(err, "Image upload failed."));
    }
  }

  async function saveSection(section: AdminPageSection) {
    setSaving(true);
    setError("");
    setFeedback("");
    try {
      await apiClient.updateAdminPageSection(section.id, {
        eyebrow: section.eyebrow,
        title: section.title,
        description: section.description,
        cta_label: section.cta_label,
        cta_url: section.cta_url,
        body_json: section.body_json,
      });
      setFeedback(`Saved “${section.section_key}” section.`);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save section."));
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
        title="Homepage content"
        description="Edit hero banner, why-choose cards, testimonials, and homepage section copy."
      />
      {error ? <AdminAlert message={error} /> : null}
      {feedback ? <p className="mb-4 text-sm text-accent">{feedback}</p> : null}

      <AdminPanel className="mb-6 space-y-4">
        <h2 className="font-display text-2xl text-stone-900">Hero slides</h2>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void saveHero(event)}>
          <Input
            label="Title"
            value={heroForm.title}
            onChange={(e) => setHeroForm((c) => ({ ...c, title: e.target.value }))}
            required
          />
          <Input
            label="Subtitle / eyebrow"
            value={heroForm.subtitle}
            onChange={(e) => setHeroForm((c) => ({ ...c, subtitle: e.target.value }))}
          />
          <label className="md:col-span-2 block space-y-1 text-sm">
            <span className="text-stone-600">Description</span>
            <textarea
              className="min-h-24 w-full rounded-xl border border-border px-3 py-2"
              value={heroForm.description}
              onChange={(e) => setHeroForm((c) => ({ ...c, description: e.target.value }))}
            />
          </label>
          <Input
            label="CTA label"
            value={heroForm.cta_label}
            onChange={(e) => setHeroForm((c) => ({ ...c, cta_label: e.target.value }))}
          />
          <Input
            label="CTA URL"
            value={heroForm.cta_url}
            onChange={(e) => setHeroForm((c) => ({ ...c, cta_url: e.target.value }))}
          />
          <Input
            label="Image path"
            value={heroForm.image_path}
            onChange={(e) => setHeroForm((c) => ({ ...c, image_path: e.target.value }))}
          />
          <label className="flex items-end">
            <input
              type="file"
              accept="image/*"
              className="text-sm"
              onChange={(e) => void uploadHeroImage(e.target.files)}
            />
          </label>
          <div className="md:col-span-2">
            <Button type="submit" disabled={saving}>
              {editingHeroId ? "Update hero slide" : "Add hero slide"}
            </Button>
          </div>
        </form>

        <div className="space-y-3">
          {heroSlides.map((slide) => (
            <div key={slide.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3">
              <div>
                <p className="font-medium text-stone-900">{slide.title}</p>
                <p className="text-xs text-stone-500">{slide.image_path}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingHeroId(slide.id);
                    setHeroForm({
                      title: slide.title,
                      subtitle: slide.subtitle ?? "",
                      description: slide.description ?? "",
                      image_path: slide.image_path ?? "",
                      cta_label: slide.cta_label ?? "",
                      cta_url: slide.cta_url ?? "",
                    });
                  }}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    void apiClient
                      .deleteAdminHeroSlide(slide.id)
                      .then(reload)
                      .catch((err) => setError(getErrorMessage(err)))
                  }
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel className="mb-6 space-y-3">
        <h2 className="font-display text-2xl text-stone-900">Why choose items ({whyItems.length})</h2>
        {whyItems.map((item) => (
          <div key={item.id} className="grid gap-2 rounded-xl border border-border p-3 md:grid-cols-[1fr_2fr_auto]">
            <Input
              label="Title"
              value={item.title}
              onChange={(e) =>
                setWhyItems((current) =>
                  current.map((row) => (row.id === item.id ? { ...row, title: e.target.value } : row)),
                )
              }
            />
            <Input
              label="Description"
              value={item.description}
              onChange={(e) =>
                setWhyItems((current) =>
                  current.map((row) =>
                    row.id === item.id ? { ...row, description: e.target.value } : row,
                  ),
                )
              }
            />
            <Button
              type="button"
              disabled={saving}
              onClick={() =>
                void apiClient
                  .updateAdminWhyChooseItem(item.id, {
                    title: item.title,
                    description: item.description,
                    icon: item.icon,
                  })
                  .then(() => setFeedback(`Saved why-choose “${item.title}”.`))
                  .catch((err) => setError(getErrorMessage(err)))
              }
            >
              Save
            </Button>
          </div>
        ))}
      </AdminPanel>

      <AdminPanel className="mb-6 space-y-3">
        <h2 className="font-display text-2xl text-stone-900">Testimonials ({testimonials.length})</h2>
        {testimonials.map((item) => (
          <div key={item.id} className="space-y-2 rounded-xl border border-border p-3">
            <Input
              label="Customer name"
              value={item.customer_name}
              onChange={(e) =>
                setTestimonials((current) =>
                  current.map((row) =>
                    row.id === item.id ? { ...row, customer_name: e.target.value } : row,
                  ),
                )
              }
            />
            <textarea
              className="min-h-20 w-full rounded-xl border border-border px-3 py-2 text-sm"
              value={item.content}
              onChange={(e) =>
                setTestimonials((current) =>
                  current.map((row) => (row.id === item.id ? { ...row, content: e.target.value } : row)),
                )
              }
            />
            <Button
              type="button"
              onClick={() =>
                void apiClient
                  .updateAdminTestimonial(item.id, {
                    customer_name: item.customer_name,
                    content: item.content,
                    rating: item.rating,
                  })
                  .then(() => setFeedback(`Saved review from ${item.customer_name}.`))
                  .catch((err) => setError(getErrorMessage(err)))
              }
            >
              Save review
            </Button>
          </div>
        ))}
      </AdminPanel>

      <AdminPanel className="space-y-4">
        <h2 className="font-display text-2xl text-stone-900">Homepage sections</h2>
        {sections.map((section) => (
          <div key={section.id} className="space-y-2 rounded-xl border border-border p-4">
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
            <textarea
              className="min-h-20 w-full rounded-xl border border-border px-3 py-2 text-sm"
              value={section.description ?? ""}
              onChange={(e) =>
                setSections((current) =>
                  current.map((row) =>
                    row.id === section.id ? { ...row, description: e.target.value } : row,
                  ),
                )
              }
            />
            <Button type="button" disabled={saving} onClick={() => void saveSection(section)}>
              Save section
            </Button>
          </div>
        ))}
      </AdminPanel>
    </AdminPage>
  );
}
