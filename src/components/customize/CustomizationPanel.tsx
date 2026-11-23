"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useCustomization } from "@/context/CustomizationContext";
import { getErrorMessage } from "@/lib/api/auth-client";
import { isNoBuckle } from "@/lib/customize/config-builder";
import { siteConfig } from "@/config/site";
import { normalizeImageUrl } from "@/lib/media";
import { cn, formatPrice } from "@/lib/utils";
import { isCustomizationComplete, selectionToApiCustomization } from "@/types/commerce";
import type { ShoeGender } from "@/types/customization";
import { Button } from "@/components/ui/Button";

function OptionGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border-b border-border pb-6">
      <h3 className="text-xs uppercase tracking-[0.32em] text-accent">{title}</h3>
      {children}
    </section>
  );
}

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

export function CustomizationPanel({ className }: { className?: string }) {
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
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function handleAddToCart() {
    if (!isCustomizationComplete(selection)) {
      setError("Please complete all customization options.");
      return;
    }

    setAdding(true);
    setError("");
    setFeedback("");

    try {
      await addItem({
        shoe_id: config.shoeId,
        quantity: 1,
        customization: selectionToApiCustomization(selection),
      });
      setFeedback("Added to cart.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to add to cart."));
    } finally {
      setAdding(false);
    }
  }

  const womenSizes = config.sizes.filter((size) => size.gender === "women");
  const menSizes = config.sizes.filter((size) => size.gender === "men");
  const availableGenders: ShoeGender[] = [
    ...(womenSizes.length > 0 ? (["women"] as const) : []),
    ...(menSizes.length > 0 ? (["men"] as const) : []),
  ];
  const activeSizes = config.sizes.filter((size) => size.gender === selection.gender);

  return (
    <div className={cn("glass-panel flex h-full flex-col rounded-[2rem] p-6 lg:p-8", className)}>
      <div className="space-y-2 border-b border-border pb-6">
        <p className="text-xs uppercase tracking-[0.28em] text-stone-600">Customization Studio</p>
        <h1 className="font-display text-4xl text-stone-900">{config.shoeName}</h1>
        <p className="truncate text-sm text-stone-700">
          Customize every detail, from material and color to buckle, sole, and fit, with an
          interactive live preview. Exclusively designed for our signature customizable shoe
          style.
        </p>
        <p className="text-xs text-stone-600">
          Estimated delivery: {siteConfig.deliveryTimeline}
        </p>
      </div>

      <div className="custom-scrollbar mt-6 flex-1 space-y-6 overflow-y-auto pr-1">
        <OptionGroup title="Gender">
          {availableGenders.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {availableGenders.map((gender) => (
                <button
                  key={gender}
                  type="button"
                  onClick={() => setGender(gender)}
                  className={cn(
                    "rounded-full border px-5 py-2.5 text-sm capitalize transition-colors",
                    selection.gender === gender
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-stone-700 hover:text-stone-900",
                  )}
                >
                  {gender}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-600">Sizes are not available for this style yet.</p>
          )}
        </OptionGroup>

        <OptionGroup title="Fabric">
          <div className="grid gap-3">
            {config.materials.map((material) => (
              <button
                key={material.id}
                type="button"
                onClick={() => setMaterial(material.id)}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border px-4 py-3 text-left transition-colors",
                  selection.materialId === material.id
                    ? "border-accent bg-accent/10 text-stone-900"
                    : "border-border text-stone-700 hover:text-stone-900",
                )}
              >
                <span
                  className="h-12 w-12 shrink-0 rounded-xl border border-stone-200/80 shadow-inner"
                  style={fabricPreviewStyle(material.slug)}
                  aria-hidden
                />
                <span>
                  <span className="block font-medium">{material.name}</span>
                  <span className="mt-0.5 block text-xs text-stone-500">
                    {material.slug.includes("suede")
                      ? "Soft brushed nap"
                      : "Smooth polished finish"}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </OptionGroup>

        {config.supportedTypes.length > 1 ? (
          <OptionGroup title="Style">
            <div className="flex flex-wrap gap-3">
              {config.supportedTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setShoeType(type)}
                  className={cn(
                    "rounded-full border px-5 py-2.5 text-sm capitalize transition-colors",
                    selection.shoeType === type
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-stone-700 hover:text-stone-900",
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </OptionGroup>
        ) : null}

        <OptionGroup title="Color">
          <div className="grid grid-cols-5 gap-3">
            {config.colors.map((color) => {
              const selected = selection.colorHex === color.hex_code;
              const swatch =
                normalizeImageUrl(color.swatch_path) ||
                normalizeImageUrl(color.swatch_url) ||
                (color.swatch_path?.startsWith("images/") ? `/${color.swatch_path}` : "");

              return (
                <button
                  key={color.id}
                  type="button"
                  aria-label={color.name}
                  title={color.name}
                  onClick={() => setColor(color.hex_code)}
                  className="group flex flex-col items-center gap-2"
                >
                  <span
                    className={cn(
                      "relative h-11 w-11 overflow-hidden rounded-full border-2 bg-cover bg-center shadow-sm",
                      selected
                        ? "border-accent ring-2 ring-accent/35 ring-offset-2"
                        : "border-stone-200 group-hover:border-stone-400",
                    )}
                    style={
                      swatch
                        ? { backgroundImage: `url(${swatch})`, backgroundColor: color.hex_code }
                        : { backgroundColor: color.hex_code }
                    }
                  >
                    {selected ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-[11px] font-bold text-white">
                        ✓
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "max-w-[4.5rem] text-center text-[10px] leading-tight uppercase tracking-[0.08em]",
                      selected ? "font-semibold text-stone-900" : "text-stone-600",
                    )}
                  >
                    {color.name}
                  </span>
                </button>
              );
            })}
          </div>
        </OptionGroup>

        <OptionGroup title="Sole">
          <div className="flex flex-wrap gap-3">
            {config.soleColors.map((sole) => (
              <button
                key={sole.id}
                type="button"
                onClick={() => setSoleColor(sole.hex_code)}
                className={cn(
                  "inline-flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors",
                  selection.soleColorHex === sole.hex_code
                    ? "border-accent bg-accent/10 text-stone-900"
                    : "border-border text-stone-800 hover:text-stone-900",
                )}
              >
                <span
                  className="h-4 w-4 shrink-0 rounded-full border border-stone-300/40"
                  style={{ backgroundColor: sole.hex_code }}
                />
                <span>{sole.name || sole.slug || sole.hex_code}</span>
              </button>
            ))}
          </div>
        </OptionGroup>

        <OptionGroup title="Buckle">
          <div className="grid max-h-[28rem] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
            {config.buckles.map((buckle) => {
              const none = isNoBuckle(buckle.slug, buckle.id);
              const thumb =
                normalizeImageUrl(buckle.thumbnail_url) ||
                normalizeImageUrl(buckle.image_url);
              return (
                <button
                  key={buckle.id}
                  type="button"
                  onClick={() => setBuckle(buckle.id)}
                  className={cn(
                    "rounded-2xl border p-3 text-left transition-colors",
                    selection.buckleId === buckle.id
                      ? "border-accent bg-accent/10 text-stone-900"
                      : "border-border text-stone-700 hover:text-stone-900",
                  )}
                >
                  <span className="mb-2 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-stone-100 bg-white px-2">
                    {none ? (
                      <span className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
                        None
                      </span>
                    ) : thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${thumb}?v=buckle-front-2`}
                        alt={buckle.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : null}
                  </span>
                  <span className="block text-sm font-medium">{buckle.name}</span>
                </button>
              );
            })}
          </div>
        </OptionGroup>

        <OptionGroup title="Size">
          {activeSizes.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.22em] text-stone-600">
                {selection.gender === "women" ? "Women" : "Men"} EU
              </p>
              <div className="flex flex-wrap gap-2">
                {activeSizes.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSize(size.id)}
                    className={cn(
                      "min-w-12 rounded-full border px-3 py-2 text-sm transition-colors",
                      selection.sizeId === size.id
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border text-stone-700 hover:text-stone-900",
                    )}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-stone-600">Select a gender to view available sizes.</p>
          )}
        </OptionGroup>
      </div>

      <div className="mt-6 hidden border-t border-border pt-6 lg:block">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-stone-600">Estimated Total</p>
            <p className="mt-2 font-display text-4xl text-accent">{formatPrice(totalPrice)}</p>
          </div>
          <Button size="lg" disabled={adding} onClick={() => void handleAddToCart()}>
            {adding ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
        {feedback ? <p className="mt-3 text-xs text-accent">{feedback}</p> : null}
        {error ? <p className="mt-3 text-xs text-red-300">{error}</p> : null}
        <p className="mt-3 text-xs text-stone-600">
          Checkout as guest or sign in to save order history.
        </p>
      </div>
    </div>
  );
}
