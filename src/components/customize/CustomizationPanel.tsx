"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useCustomization } from "@/context/CustomizationContext";
import { getErrorMessage } from "@/lib/api/auth-client";
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

export function CustomizationPanel() {
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
    <div className="glass-panel flex h-full flex-col rounded-[2rem] p-6 lg:p-8">
      <div className="space-y-2 border-b border-border pb-6">
        <p className="text-xs uppercase tracking-[0.28em] text-stone-600">Customization Studio</p>
        <h1 className="font-display text-4xl text-stone-900">{config.shoeName}</h1>
        <p className="text-sm text-stone-700">
          Configure gender, fabric, style, color, sole, buckle, and size with live 3D preview.
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
                    "rounded-full border px-5 py-2.5 text-sm capitalize transition",
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
                  "rounded-2xl border px-4 py-3 text-left transition",
                  selection.materialId === material.id
                    ? "border-accent bg-accent/10 text-stone-900"
                    : "border-border text-stone-700 hover:text-stone-900",
                )}
              >
                <span className="block font-medium">{material.name}</span>
                {material.price_modifier > 0 ? (
                  <span className="mt-1 block text-xs text-stone-600">
                    +{formatPrice(material.price_modifier)}
                  </span>
                ) : null}
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
                    "rounded-full border px-5 py-2.5 text-sm capitalize transition",
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
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
            {config.colors.map((color) => {
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
                  className={cn(
                    "group flex flex-col items-center gap-2",
                    selection.colorHex === color.hex_code && "opacity-100",
                  )}
                >
                  <span
                    className={cn(
                      "h-11 w-11 overflow-hidden rounded-full border-2 bg-cover bg-center shadow-sm transition",
                      selection.colorHex === color.hex_code
                        ? "scale-110 border-accent"
                        : "border-stone-200 group-hover:border-stone-400",
                    )}
                    style={
                      swatch
                        ? { backgroundImage: `url(${swatch})`, backgroundColor: color.hex_code }
                        : { backgroundColor: color.hex_code }
                    }
                  />
                  <span className="max-w-[4.5rem] text-center text-[10px] leading-tight uppercase tracking-[0.08em] text-stone-600">
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
                  "inline-flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm transition",
                  selection.soleColorHex === sole.hex_code
                    ? "border-accent bg-accent/10 text-stone-900"
                    : "border-border text-stone-700 hover:text-stone-900",
                )}
              >
                <span
                  className="h-4 w-4 rounded-full border border-stone-300/40"
                  style={{ backgroundColor: sole.hex_code }}
                />
                {sole.name}
              </button>
            ))}
          </div>
        </OptionGroup>

        <OptionGroup title="Buckle">
          <div className="grid gap-3">
            {config.buckles.map((buckle) => (
              <button
                key={buckle.id}
                type="button"
                onClick={() => setBuckle(buckle.id)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition",
                  selection.buckleId === buckle.id
                    ? "border-accent bg-accent/10 text-stone-900"
                    : "border-border text-stone-700 hover:text-stone-900",
                )}
              >
                <span className="block font-medium">{buckle.name}</span>
                {buckle.price_modifier > 0 ? (
                  <span className="mt-1 block text-xs text-stone-600">
                    +{formatPrice(buckle.price_modifier)}
                  </span>
                ) : null}
              </button>
            ))}
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
                      "min-w-12 rounded-full border px-3 py-2 text-sm transition",
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

      <div className="mt-6 border-t border-border pt-6">
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
