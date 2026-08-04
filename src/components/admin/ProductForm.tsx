"use client";

import { FormEvent, useState } from "react";
import { getErrorMessage } from "@/lib/api/auth-client";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { AdminProductOptions, AdminShoeInput } from "@/types/commerce";
import type { CollectionSummary } from "@/types/api";

export const defaultShoeModelPaths = {
  body_model_path: "models/shoes/ivory-gold-bit-mule/body.glb",
  sole_model_path: "models/shoes/ivory-gold-bit-mule/sole.glb",
  logo_model_path: "models/shoes/ivory-gold-bit-mule/logo.glb",
  inner_model_path: "models/shoes/ivory-gold-bit-mule/inner.glb",
  default_buckle_model_path: "models/buckles/classic-oval.glb",
};

export function createEmptyShoeForm(): AdminShoeInput {
  return {
    collection_id: null,
    name: "",
    slug: "",
    description: "",
    base_price: 2999,
    thumbnail_path: "",
    ...defaultShoeModelPaths,
    supported_types: ["covered"],
    is_featured: false,
    is_active: true,
    sort_order: 0,
    material_ids: [],
    color_ids: [],
    buckle_ids: [],
    size_ids: [],
  };
}

interface ProductFormProps {
  collections: CollectionSummary[];
  options: AdminProductOptions;
  initialValues: AdminShoeInput;
  submitLabel: string;
  onSubmit: (values: AdminShoeInput) => Promise<void>;
  onCancel: () => void;
}

function toggleId(list: number[], id: number): number[] {
  return list.includes(id) ? list.filter((entry) => entry !== id) : [...list, id];
}

function OptionGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-700">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function ProductForm({
  collections,
  options,
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [form, setForm] = useState<AdminShoeInput>(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await onSubmit({
        ...form,
        collection_id: form.collection_id ? Number(form.collection_id) : null,
        base_price: Number(form.base_price),
        sort_order: Number(form.sort_order ?? 0),
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-8">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="glass-panel grid gap-8 rounded-[1.5rem] p-6 lg:grid-cols-[minmax(280px,340px)_1fr]">
        <ImageUploadField
          value={form.thumbnail_path ?? ""}
          slug={form.slug ?? ""}
          onChange={(path) => setForm((current) => ({ ...current, thumbnail_path: path }))}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Product Name"
            name="name"
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <Input
            label="Slug (optional)"
            name="slug"
            value={form.slug ?? ""}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
          />
          <label className="block space-y-2 sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-700">Collection</span>
            <select
              value={form.collection_id ?? ""}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  collection_id: event.target.value ? Number(event.target.value) : null,
                }))
              }
              className="h-14 w-full rounded-2xl border border-border bg-white px-5 text-base text-stone-900 outline-none transition focus:border-accent shadow-sm"
            >
              <option value="">Unassigned</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Price (PKR)"
            name="base_price"
            type="number"
            min="0"
            step="1"
            required
            value={form.base_price}
            onChange={(event) => setForm((current) => ({ ...current, base_price: Number(event.target.value) }))}
          />
          <Input
            label="Sort Order"
            name="sort_order"
            type="number"
            min="0"
            value={form.sort_order ?? 0}
            onChange={(event) => setForm((current) => ({ ...current, sort_order: Number(event.target.value) }))}
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Description"
              name="description"
              value={form.description ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="glass-panel grid gap-4 rounded-[1.5rem] p-6 sm:grid-cols-2">
        <label className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3">
          <input
            type="checkbox"
            checked={form.is_active ?? true}
            onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
          />
          <span className="text-sm text-stone-800">Active on storefront</span>
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3">
          <input
            type="checkbox"
            checked={form.is_featured ?? false}
            onChange={(event) => setForm((current) => ({ ...current, is_featured: event.target.checked }))}
          />
          <span className="text-sm text-stone-800">Featured product</span>
        </label>
        <label className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3">
          <input
            type="checkbox"
            checked={form.supported_types?.includes("covered") ?? false}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                supported_types: event.target.checked ? ["covered"] : ["backless"],
              }))
            }
          />
          <span className="text-sm text-stone-800">Covered style</span>
        </label>
      </div>

      <div className="glass-panel space-y-6 rounded-[1.5rem] p-6">
        <OptionGroup title="Materials">
          {options.materials.map((material) => (
            <label
              key={material.id}
              className={`rounded-full border px-4 py-2 text-sm ${
                form.material_ids?.includes(material.id)
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-stone-700"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={form.material_ids?.includes(material.id) ?? false}
                onChange={() =>
                  setForm((current) => ({
                    ...current,
                    material_ids: toggleId(current.material_ids ?? [], material.id),
                  }))
                }
              />
              {material.name}
            </label>
          ))}
        </OptionGroup>

        <OptionGroup title="Colors">
          {options.colors.map((color) => (
            <label
              key={color.id}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${
                form.color_ids?.includes(color.id)
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-stone-700"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={form.color_ids?.includes(color.id) ?? false}
                onChange={() =>
                  setForm((current) => ({
                    ...current,
                    color_ids: toggleId(current.color_ids ?? [], color.id),
                  }))
                }
              />
              <span
                className="h-3 w-3 rounded-full border border-border"
                style={{ backgroundColor: color.hex_code }}
              />
              {color.name}
            </label>
          ))}
        </OptionGroup>

        <OptionGroup title="Sizes">
          {options.sizes.map((size) => (
            <label
              key={size.id}
              className={`rounded-full border px-4 py-2 text-sm capitalize ${
                form.size_ids?.includes(size.id)
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-stone-700"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={form.size_ids?.includes(size.id) ?? false}
                onChange={() =>
                  setForm((current) => ({
                    ...current,
                    size_ids: toggleId(current.size_ids ?? [], size.id),
                  }))
                }
              />
              {size.label} ({size.gender})
            </label>
          ))}
        </OptionGroup>

        <OptionGroup title="Buckles">
          {options.buckles.map((buckle) => (
            <label
              key={buckle.id}
              className={`rounded-full border px-4 py-2 text-sm ${
                form.buckle_ids?.includes(buckle.id)
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-stone-700"
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={form.buckle_ids?.includes(buckle.id) ?? false}
                onChange={() =>
                  setForm((current) => ({
                    ...current,
                    buckle_ids: toggleId(current.buckle_ids ?? [], buckle.id),
                  }))
                }
              />
              {buckle.name}
            </label>
          ))}
        </OptionGroup>
      </div>

      <details className="glass-panel rounded-[1.5rem] p-6">
        <summary className="cursor-pointer text-sm uppercase tracking-[0.2em] text-stone-700">
          Advanced: 3D model paths
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(
            [
              ["body_model_path", "Body Model"],
              ["sole_model_path", "Sole Model"],
              ["logo_model_path", "Logo Model"],
              ["inner_model_path", "Inner Model"],
              ["default_buckle_model_path", "Default Buckle Model"],
            ] as const
          ).map(([key, label]) => (
            <Input
              key={key}
              label={label}
              name={key}
              value={form[key] ?? ""}
              onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
            />
          ))}
        </div>
      </details>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function shoeToForm(shoe: import("@/types/commerce").AdminShoe): AdminShoeInput {
  return {
    collection_id: shoe.collection_id ?? shoe.collection?.id ?? null,
    name: shoe.name,
    slug: shoe.slug,
    description: shoe.description ?? "",
    base_price: shoe.base_price,
    thumbnail_path: shoe.thumbnail_path ?? "",
    body_model_path: shoe.body_model_path ?? defaultShoeModelPaths.body_model_path,
    sole_model_path: shoe.sole_model_path ?? defaultShoeModelPaths.sole_model_path,
    logo_model_path: shoe.logo_model_path ?? defaultShoeModelPaths.logo_model_path,
    inner_model_path: shoe.inner_model_path ?? defaultShoeModelPaths.inner_model_path,
    default_buckle_model_path:
      shoe.default_buckle_model_path ?? defaultShoeModelPaths.default_buckle_model_path,
    supported_types: shoe.supported_types ?? ["covered"],
    is_featured: shoe.is_featured,
    is_active: shoe.is_active ?? true,
    sort_order: shoe.sort_order ?? 0,
    material_ids: shoe.material_ids ?? [],
    color_ids: shoe.color_ids ?? [],
    buckle_ids: shoe.buckle_ids ?? [],
    size_ids: shoe.size_ids ?? [],
  };
}

export { shoeToForm };
