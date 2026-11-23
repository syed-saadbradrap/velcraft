"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useCustomization } from "@/context/CustomizationContext";
import { isNoBuckle } from "@/lib/customize/config-builder";
import { normalizeImageUrl } from "@/lib/media";
import { cn, formatPrice } from "@/lib/utils";
import { isCustomizationComplete, selectionToApiCustomization } from "@/types/commerce";
import { Button } from "@/components/ui/Button";

type MobileTab = "material" | "color" | "buckle" | "sole" | "type" | "size";

const TABS: { id: MobileTab; label: string; next: string }[] = [
  { id: "material", label: "Material", next: "Color" },
  { id: "color", label: "Color", next: "Buckle" },
  { id: "buckle", label: "Buckle", next: "Sole" },
  { id: "sole", label: "Sole", next: "Type" },
  { id: "type", label: "Type", next: "Size" },
  { id: "size", label: "Size", next: "Review" },
];

function fabricPreviewStyle(slug: string): React.CSSProperties {
  if (slug.includes("suede")) {
    return {
      backgroundImage:
        "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.35), transparent 45%), linear-gradient(145deg, #8a7364 0%, #5c463a 48%, #3f2f28 100%)",
    };
  }
  return {
    backgroundImage:
      "linear-gradient(125deg, rgba(255,255,255,0.45) 0%, transparent 32%, transparent 62%, rgba(255,255,255,0.2) 100%), linear-gradient(160deg, #6b5246 0%, #3d2a22 55%, #2a1c17 100%)",
  };
}

export type MobileCustomizePhase = "landing" | "customize" | "review";

export function CustomizeMobileLanding({ onStart }: { onStart: () => void }) {
  const { config } = useCustomization();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="font-display text-[2.35rem] leading-[1.05] text-stone-900">
          Customize Your Pair
        </h1>
        <p className="text-sm leading-6 text-stone-600">
          Personalize material, color, buckle, sole, and fit with a live preview.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl border border-border px-2 py-3">
          <p className="font-display text-xl text-stone-900">{config.colors.length}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-stone-500">
            Shoe Colors
          </p>
        </div>
        <div className="rounded-2xl border border-border px-2 py-3">
          <p className="font-display text-xl text-stone-900">
            {Math.max(0, config.buckles.length - 1)}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-stone-500">
            Buckle Options
          </p>
        </div>
        <div className="rounded-2xl border border-border px-2 py-3">
          <p className="font-display text-xl text-stone-900">{config.materials.length}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-stone-500">
            Materials
          </p>
        </div>
      </div>
      <Button size="lg" className="h-14 w-full" onClick={onStart}>
        Start Customizing →
      </Button>
    </div>
  );
}

export function CustomizeMobileStepper({
  phase,
  onBack,
}: {
  phase: Exclude<MobileCustomizePhase, "landing">;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.16em] text-stone-500">
      <button type="button" onClick={onBack}>
        ← Back
      </button>
      <div className="flex items-center gap-2">
        <span>1 Style</span>
        <span>/</span>
        <span className={cn(phase === "customize" && "font-semibold text-accent")}>
          2 Customize
        </span>
        <span>/</span>
        <span className={cn(phase === "review" && "font-semibold text-accent")}>3 Review</span>
      </div>
    </div>
  );
}

export function CustomizeMobileControls({
  phase,
  onReview,
}: {
  phase: Exclude<MobileCustomizePhase, "landing">;
  onReview: () => void;
}) {
  const { addItem } = useCart();
  const {
    config,
    selection,
    totalPrice,
    setMaterial,
    setColor,
    setSoleColor,
    setBuckle,
    setShoeType,
    setGender,
    setSize,
  } = useCustomization();

  const [tab, setTab] = useState<MobileTab>("material");
  const [adding, setAdding] = useState(false);

  const tabIndex = TABS.findIndex((item) => item.id === tab);
  const currentTab = TABS[tabIndex] ?? TABS[0];
  const activeSizes = useMemo(
    () => config.sizes.filter((size) => size.gender === selection.gender),
    [config.sizes, selection.gender],
  );

  async function handleAddToCart() {
    if (!isCustomizationComplete(selection)) return;
    setAdding(true);
    try {
      await addItem({
        shoe_id: config.shoeId,
        quantity: 1,
        customization: selectionToApiCustomization(selection),
      });
    } finally {
      setAdding(false);
    }
  }

  function goNext() {
    if (tabIndex < TABS.length - 1) {
      setTab(TABS[tabIndex + 1].id);
      return;
    }
    onReview();
  }

  if (phase === "review") {
    return (
      <div className="space-y-4 rounded-[1.25rem] border border-border bg-white/80 p-5">
        <h2 className="font-display text-2xl text-stone-900">Review your design</h2>
        <dl className="space-y-2 text-sm text-stone-700">
          <div className="flex justify-between gap-3">
            <dt className="text-stone-500">Material</dt>
            <dd>
              {config.materials.find((item) => item.id === selection.materialId)?.name ?? "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-stone-500">Color</dt>
            <dd>
              {config.colors.find((item) => item.hex_code === selection.colorHex)?.name ?? "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-stone-500">Buckle</dt>
            <dd>{config.buckles.find((item) => item.id === selection.buckleId)?.name ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-stone-500">Sole</dt>
            <dd>
              {config.soleColors.find((item) => item.hex_code === selection.soleColorHex)?.name ??
                "—"}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-stone-500">Type</dt>
            <dd className="capitalize">{selection.shoeType}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-stone-500">Size</dt>
            <dd className="capitalize">
              {selection.gender} ·{" "}
              {activeSizes.find((size) => size.id === selection.sizeId)?.label ?? "—"}
            </dd>
          </div>
        </dl>
        <div className="flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-stone-500">Total</p>
            <p className="font-display text-3xl text-stone-900">{formatPrice(totalPrice)}</p>
          </div>
          <Button
            size="lg"
            disabled={adding || !isCustomizationComplete(selection)}
            onClick={() => void handleAddToCart()}
          >
            {adding ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-6 gap-1">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "rounded-full border px-0.5 py-2 text-center text-[8px] font-semibold uppercase leading-none tracking-[0.06em] transition-colors",
              tab === item.id
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-border bg-white text-stone-600",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="rounded-[1.1rem] border border-border bg-stone-100/70 p-2.5">
        <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-accent">{currentTab.label}</p>

        {tab === "material" ? (
          <div className="grid grid-cols-2 gap-2">
            {config.materials.map((material) => (
              <button
                key={material.id}
                type="button"
                onClick={() => setMaterial(material.id)}
                className={cn(
                  "rounded-xl border p-2 text-left transition-colors",
                  selection.materialId === material.id
                    ? "border-stone-900 bg-white/70"
                    : "border-border bg-transparent",
                )}
              >
                <span
                  className="mb-1.5 block h-11 rounded-lg border border-stone-200/80"
                  style={fabricPreviewStyle(material.slug)}
                />
                <span className="block text-xs font-medium text-stone-900">{material.name}</span>
              </button>
            ))}
          </div>
        ) : null}

        {tab === "color" ? (
          <div className="grid grid-cols-6 gap-2">
            {config.colors.map((color) => {
              const selected = selection.colorHex === color.hex_code;
              return (
                <button
                  key={color.id}
                  type="button"
                  aria-label={color.name}
                  onClick={() => setColor(color.hex_code)}
                  className="flex flex-col items-center"
                >
                  <span
                    className={cn(
                      "relative h-8 w-8 rounded-full border-2",
                      selected
                        ? "border-stone-900 ring-2 ring-stone-900/20"
                        : "border-stone-200",
                    )}
                    style={{ backgroundColor: color.hex_code }}
                  >
                    {selected ? (
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">
                        ✓
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        {tab === "buckle" ? (
          <div className="grid grid-cols-3 gap-1.5">
            {config.buckles.map((buckle) => {
              const none = isNoBuckle(buckle.slug, buckle.id);
              const thumb =
                normalizeImageUrl(buckle.thumbnail_url) || normalizeImageUrl(buckle.image_url);
              return (
                <button
                  key={buckle.id}
                  type="button"
                  onClick={() => setBuckle(buckle.id)}
                  className={cn(
                    "rounded-lg border p-1.5 text-left transition-colors",
                    selection.buckleId === buckle.id
                      ? "border-stone-900 bg-white/80"
                      : "border-border bg-transparent",
                  )}
                >
                  <span className="mb-1 flex h-9 items-center justify-center rounded-md bg-[#2a241f] px-1">
                    {none ? (
                      <span className="text-[9px] uppercase tracking-[0.14em] text-stone-400">
                        None
                      </span>
                    ) : thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt=""
                        className="max-h-7 max-w-full object-contain"
                      />
                    ) : null}
                  </span>
                  <span className="block truncate text-[10px] font-medium leading-tight text-stone-800">
                    {buckle.name}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        {tab === "sole" ? (
          <div className="flex flex-wrap gap-2">
            {config.soleColors.map((sole) => (
              <button
                key={sole.id}
                type="button"
                onClick={() => setSoleColor(sole.hex_code)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
                  selection.soleColorHex === sole.hex_code
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-border text-stone-700",
                )}
              >
                <span
                  className="h-3 w-3 rounded-full border border-white/40"
                  style={{ backgroundColor: sole.hex_code }}
                />
                {sole.name}
              </button>
            ))}
          </div>
        ) : null}

        {tab === "type" ? (
          <div className="flex flex-wrap gap-2">
            {config.supportedTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setShoeType(type)}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs capitalize",
                  selection.shoeType === type
                    ? "border-stone-900 bg-stone-900 text-white"
                    : "border-border bg-transparent text-stone-700",
                )}
              >
                {type}
              </button>
            ))}
          </div>
        ) : null}

        {tab === "size" ? (
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-stone-500">Gender</p>
              <div className="flex flex-wrap gap-1.5">
                {(["women", "men"] as const)
                  .filter((gender) => config.sizes.some((size) => size.gender === gender))
                  .map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => setGender(gender)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs capitalize",
                        selection.gender === gender
                          ? "border-stone-900 bg-stone-900 text-white"
                          : "border-border bg-transparent text-stone-700",
                      )}
                    >
                      {gender}
                    </button>
                  ))}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-stone-500">
                EU Size
              </p>
              {activeSizes.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {activeSizes.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSize(size.id)}
                      className={cn(
                        "min-w-9 rounded-full border px-2.5 py-1.5 text-xs",
                        selection.sizeId === size.id
                          ? "border-stone-900 bg-stone-900 text-white"
                          : "border-border bg-transparent text-stone-700",
                      )}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-500">Select a gender to view sizes.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <Button size="lg" className="h-11 w-full text-sm" onClick={goNext}>
        Next: {currentTab.next} →
      </Button>
    </div>
  );
}
