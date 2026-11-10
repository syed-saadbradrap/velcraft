"use client";

import { useState } from "react";
import { getErrorMessage } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { AdminProductOptions } from "@/types/commerce";

interface ProductOptionsPanelProps {
  options: AdminProductOptions;
  materialIds: number[];
  colorIds: number[];
  sizeIds: number[];
  buckleIds: number[];
  onToggleMaterial: (id: number) => void;
  onToggleColor: (id: number) => void;
  onToggleSize: (id: number) => void;
  onToggleBuckle: (id: number) => void;
  onRefreshOptions: () => Promise<void>;
  onSelectionCleanup: (removed: {
    materialIds?: number[];
    colorIds?: number[];
    sizeIds?: number[];
    buckleIds?: number[];
  }) => void;
}

function SectionHeader({
  title,
  onAdd,
  adding,
}: {
  title: string;
  onAdd: () => void;
  adding: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-700">{title}</p>
      <button
        type="button"
        onClick={onAdd}
        className="rounded-full border border-border px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-stone-600 transition hover:border-accent/35 hover:text-accent"
      >
        {adding ? "Cancel" : "+ Add New"}
      </button>
    </div>
  );
}

function SelectableChip({
  label,
  selected,
  onSelect,
  onDelete,
  swatch,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  swatch?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border pl-4 pr-1 py-1 text-sm",
        selected ? "border-accent bg-accent/10 text-accent" : "border-border text-stone-700",
      )}
    >
      <button type="button" onClick={onSelect} className="inline-flex items-center gap-2">
        {swatch ? (
          <span
            className="h-3 w-3 rounded-full border border-border"
            style={{ backgroundColor: swatch }}
          />
        ) : null}
        {label}
      </button>
      <button
        type="button"
        aria-label={`Delete ${label}`}
        onClick={onDelete}
        className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-stone-400 transition hover:bg-red-50 hover:text-red-600"
      >
        ×
      </button>
    </div>
  );
}

export function ProductOptionsPanel({
  options,
  materialIds,
  colorIds,
  sizeIds,
  buckleIds,
  onToggleMaterial,
  onToggleColor,
  onToggleSize,
  onToggleBuckle,
  onRefreshOptions,
  onSelectionCleanup,
}: ProductOptionsPanelProps) {
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [showColorForm, setShowColorForm] = useState(false);
  const [showSizeForm, setShowSizeForm] = useState(false);
  const [showBuckleForm, setShowBuckleForm] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [materialName, setMaterialName] = useState("");
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#6B4423");
  const [sizeGender, setSizeGender] = useState<"men" | "women">("men");
  const [sizeValue, setSizeValue] = useState("42");
  const [buckleName, setBuckleName] = useState("");

  async function runAction(key: string, action: () => Promise<void>) {
    setBusy(key);
    setError("");
    try {
      await action();
      await onRefreshOptions();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function handleAddMaterial() {
    if (!materialName.trim()) return;

    await runAction("material-add", async () => {
      await apiClient.createAdminMaterial({ name: materialName.trim() });
      setMaterialName("");
      setShowMaterialForm(false);
    });
  }

  async function handleAddColor() {
    if (!colorName.trim()) return;

    await runAction("color-add", async () => {
      await apiClient.createAdminColor({ name: colorName.trim(), hex_code: colorHex });
      setColorName("");
      setShowColorForm(false);
    });
  }

  async function handleAddSize() {
    const value = Number(sizeValue);
    if (!Number.isFinite(value)) return;

    await runAction("size-add", async () => {
      await apiClient.createAdminSize({
        gender: sizeGender,
        value,
        label: String(value),
      });
      setSizeValue("42");
      setShowSizeForm(false);
    });
  }

  async function handleAddBuckle() {
    if (!buckleName.trim()) return;

    await runAction("buckle-add", async () => {
      await apiClient.createAdminBuckle({ name: buckleName.trim() });
      setBuckleName("");
      setShowBuckleForm(false);
    });
  }

  async function handleDelete(type: "material" | "color" | "size" | "buckle", id: number, label: string) {
    if (!window.confirm(`Delete "${label}" from the catalog? This removes it from all products.`)) {
      return;
    }

    await runAction(`${type}-${id}`, async () => {
      if (type === "material") {
        await apiClient.deleteAdminMaterial(id);
        onSelectionCleanup({ materialIds: materialIds.filter((entry) => entry !== id) });
      } else if (type === "color") {
        await apiClient.deleteAdminColor(id);
        onSelectionCleanup({ colorIds: colorIds.filter((entry) => entry !== id) });
      } else if (type === "size") {
        await apiClient.deleteAdminSize(id);
        onSelectionCleanup({ sizeIds: sizeIds.filter((entry) => entry !== id) });
      } else {
        await apiClient.deleteAdminBuckle(id);
        onSelectionCleanup({ buckleIds: buckleIds.filter((entry) => entry !== id) });
      }
    });
  }

  return (
    <div className="glass-panel space-y-8 rounded-[1.5rem] p-6">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <p className="text-sm text-stone-600">
        Select options for this product, or add and remove catalog items using the buttons below.
      </p>

      <section className="space-y-3">
        <SectionHeader
          title="Materials"
          adding={showMaterialForm}
          onAdd={() => setShowMaterialForm((current) => !current)}
        />
        {showMaterialForm ? (
          <div className="flex flex-wrap gap-2">
            <Input
              label="Material Name"
              name="material_name"
              value={materialName}
              onChange={(event) => setMaterialName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleAddMaterial();
                }
              }}
              className="min-w-[220px] flex-1"
            />
            <Button
              type="button"
              size="sm"
              className="self-end"
              disabled={busy === "material-add"}
              onClick={() => void handleAddMaterial()}
            >
              {busy === "material-add" ? "Adding..." : "Add Material"}
            </Button>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {options.materials.map((material) => (
            <SelectableChip
              key={material.id}
              label={material.name}
              selected={materialIds.includes(material.id)}
              onSelect={() => onToggleMaterial(material.id)}
              onDelete={() => void handleDelete("material", material.id, material.name)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Colors"
          adding={showColorForm}
          onAdd={() => setShowColorForm((current) => !current)}
        />
        {showColorForm ? (
          <div className="flex flex-wrap items-end gap-3">
            <Input
              label="Color Name"
              name="color_name"
              value={colorName}
              onChange={(event) => setColorName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleAddColor();
                }
              }}
              className="min-w-[180px] flex-1"
            />
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-700">Hex</span>
              <input
                type="color"
                value={colorHex}
                onChange={(event) => setColorHex(event.target.value)}
                className="h-14 w-20 cursor-pointer rounded-2xl border border-border bg-white p-1"
              />
            </label>
            <Button type="button" size="sm" disabled={busy === "color-add"} onClick={() => void handleAddColor()}>
              {busy === "color-add" ? "Adding..." : "Add Color"}
            </Button>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {options.colors.map((color) => (
            <SelectableChip
              key={color.id}
              label={color.name}
              swatch={color.hex_code}
              selected={colorIds.includes(color.id)}
              onSelect={() => onToggleColor(color.id)}
              onDelete={() => void handleDelete("color", color.id, color.name)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Sizes"
          adding={showSizeForm}
          onAdd={() => setShowSizeForm((current) => !current)}
        />
        {showSizeForm ? (
          <div className="flex flex-wrap items-end gap-3">
            <label className="block space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-700">Gender</span>
              <select
                value={sizeGender}
                onChange={(event) => setSizeGender(event.target.value as "men" | "women")}
                className="h-14 rounded-2xl border border-border bg-white px-4 text-sm text-stone-900 outline-none focus:border-accent"
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
              </select>
            </label>
            <Input
              label="EU Size"
              name="size_value"
              type="number"
              min="30"
              max="50"
              value={sizeValue}
              onChange={(event) => setSizeValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleAddSize();
                }
              }}
              className="w-28"
            />
            <Button type="button" size="sm" disabled={busy === "size-add"} onClick={() => void handleAddSize()}>
              {busy === "size-add" ? "Adding..." : "Add Size"}
            </Button>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {options.sizes.map((size) => (
            <SelectableChip
              key={size.id}
              label={`${size.label} (${size.gender})`}
              selected={sizeIds.includes(size.id)}
              onSelect={() => onToggleSize(size.id)}
              onDelete={() => void handleDelete("size", size.id, `${size.label} ${size.gender}`)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Buckles"
          adding={showBuckleForm}
          onAdd={() => setShowBuckleForm((current) => !current)}
        />
        {showBuckleForm ? (
          <div className="flex flex-wrap gap-2">
            <Input
              label="Buckle Name"
              name="buckle_name"
              value={buckleName}
              onChange={(event) => setBuckleName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleAddBuckle();
                }
              }}
              className="min-w-[220px] flex-1"
            />
            <Button
              type="button"
              size="sm"
              className="self-end"
              disabled={busy === "buckle-add"}
              onClick={() => void handleAddBuckle()}
            >
              {busy === "buckle-add" ? "Adding..." : "Add Buckle"}
            </Button>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {options.buckles.map((buckle) => (
            <SelectableChip
              key={buckle.id}
              label={buckle.name}
              selected={buckleIds.includes(buckle.id)}
              onSelect={() => onToggleBuckle(buckle.id)}
              onDelete={() => void handleDelete("buckle", buckle.id, buckle.name)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
