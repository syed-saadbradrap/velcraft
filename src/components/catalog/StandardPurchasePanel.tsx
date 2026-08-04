"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import {
  buildDefaultCustomization,
  customizeUrl,
  isCustomizableShoe,
} from "@/lib/catalog/purchase";
import { isCatalogProduct } from "@/lib/catalog/product-display";
import { getErrorMessage } from "@/lib/api/auth-client";
import { cn, formatPrice } from "@/lib/utils";
import type { ShoeDetail } from "@/types/api";
import type { ShoeGender } from "@/types/customization";
import { Button } from "@/components/ui/Button";

interface StandardPurchasePanelProps {
  shoe: ShoeDetail;
}

export function StandardPurchasePanel({ shoe }: StandardPurchasePanelProps) {
  const { addItem } = useCart();
  const customizable = isCustomizableShoe(shoe.slug);
  const catalogProduct = isCatalogProduct(shoe.slug);

  const womenSizes = catalogProduct ? [] : shoe.sizes?.filter((size) => size.gender === "women") ?? [];
  const menSizes = shoe.sizes?.filter((size) => size.gender === "men") ?? [];
  const availableGenders: ShoeGender[] = catalogProduct
    ? ["men"]
    : [
        ...(womenSizes.length > 0 ? (["women"] as const) : []),
        ...(menSizes.length > 0 ? (["men"] as const) : []),
      ];

  const [gender, setGender] = useState<ShoeGender>(catalogProduct ? "men" : availableGenders[0] ?? "men");
  const activeSizes = useMemo(
    () => shoe.sizes?.filter((size) => size.gender === gender) ?? [],
    [gender, shoe.sizes],
  );
  const [sizeId, setSizeId] = useState<number | null>(activeSizes[0]?.id ?? null);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function handleAddToCart() {
    if (!sizeId) {
      setError("Please select a size.");
      return;
    }

    setAdding(true);
    setError("");
    setFeedback("");

    try {
      const customization = buildDefaultCustomization(shoe);
      await addItem({
        shoe_id: shoe.id,
        quantity: 1,
        customization: { ...customization, size_id: sizeId },
      });
      setFeedback("Added to cart.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to add to cart."));
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-6 rounded-[1.5rem] border border-border bg-stone-100/[0.03] p-4 sm:p-6">
      {availableGenders.length > 0 ? (
        <div className="space-y-4">
          {!catalogProduct && availableGenders.length > 1 ? (
          <label className="block space-y-2">
            <span className="text-xs uppercase tracking-[0.22em] text-stone-600">Gender</span>
            <select
              value={gender}
              onChange={(event) => {
                const nextGender = event.target.value as ShoeGender;
                setGender(nextGender);
                const nextSizes = shoe.sizes?.filter((size) => size.gender === nextGender) ?? [];
                setSizeId(nextSizes[0]?.id ?? null);
              }}
              className="w-full rounded-2xl border border-border bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-accent"
            >
              {availableGenders.includes("women") ? <option value="women">Women</option> : null}
              {availableGenders.includes("men") ? <option value="men">Men</option> : null}
            </select>
          </label>
          ) : (
            <p className="text-xs uppercase tracking-[0.22em] text-stone-600">
              Men&apos;s sizing · EU 40–45
            </p>
          )}

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-600">
              Size ({catalogProduct || gender === "men" ? "Men" : "Women"} EU)
            </p>
            <div className="flex flex-wrap gap-2">
              {activeSizes.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setSizeId(size.id)}
                  className={cn(
                    "min-h-11 min-w-11 rounded-full border px-3 py-2.5 text-sm transition",
                    sizeId === size.id
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-stone-700 hover:text-stone-900",
                  )}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-4">
        {customizable ? (
          <Button href={customizeUrl()} size="lg">
            Customize Now
          </Button>
        ) : null}
        <Button size="lg" variant={customizable ? "secondary" : "primary"} disabled={adding} onClick={() => void handleAddToCart()}>
          {adding ? "Adding..." : `Add to Cart · ${formatPrice(shoe.base_price)}`}
        </Button>
      </div>

      {customizable ? (
        <p className="text-xs leading-6 text-stone-600">
          Open the customization studio to personalize fabric, color, buckle, and sole on this signature
          style.
        </p>
      ) : (
        <p className="text-xs leading-6 text-stone-600">
          Standard finish with curated fabrics for this silhouette.
        </p>
      )}

      {feedback ? <p className="text-xs text-accent">{feedback}</p> : null}
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
