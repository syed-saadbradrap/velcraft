"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ProductMobilePurchaseBarProps {
  price: number;
  selectedSizeLabel?: string;
  adding: boolean;
  feedback?: string;
  error?: string;
  onAddToCart: () => void;
}

export function ProductMobilePurchaseBar({
  price,
  selectedSizeLabel,
  adding,
  feedback,
  error,
  onAddToCart,
}: ProductMobilePurchaseBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-[80] border-t border-stone-200/90 bg-white/98 lg:hidden",
        "shadow-[0_-12px_40px_rgba(28,25,23,0.1)] backdrop-blur-xl",
      )}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      role="region"
      aria-label="Purchase actions"
    >
      <div className="mx-auto w-full max-w-7xl px-4 pt-3">
        {feedback ? (
          <p className="mb-2 rounded-xl bg-accent/10 px-3 py-2 text-center text-xs font-medium text-accent">
            {feedback}
          </p>
        ) : null}
        {error ? (
          <p className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600">
            {error}
          </p>
        ) : null}

        <div className="mb-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.28em] text-stone-500">Total</p>
            <p className="font-display text-[1.65rem] leading-none text-stone-900">{formatPrice(price)}</p>
          </div>
          {selectedSizeLabel ? (
            <span className="shrink-0 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              EU {selectedSizeLabel}
            </span>
          ) : (
            <span className="shrink-0 rounded-full border border-stone-200 bg-stone-50 px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-stone-500">
              Pick size
            </span>
          )}
        </div>

        <Button
          size="lg"
          variant="primary"
          disabled={adding}
          className="h-14 w-full text-base font-semibold"
          onClick={onAddToCart}
        >
          {adding ? "Adding to cart..." : "Add to Cart"}
        </Button>
      </div>
    </div>,
    document.body,
  );
}
