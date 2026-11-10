"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/context/CartContext";
import { useCustomization } from "@/context/CustomizationContext";
import { formatPrice } from "@/lib/utils";
import { isCustomizationComplete, selectionToApiCustomization } from "@/types/commerce";
import { Button } from "@/components/ui/Button";

export function CustomizeMobileBar() {
  const { addItem } = useCart();
  const { config, selection, totalPrice } = useCustomization();
  const [adding, setAdding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleAddToCart() {
    if (!isCustomizationComplete(selection)) {
      return;
    }

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

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-stone-200/90 bg-white/98 shadow-[0_-12px_40px_rgba(28,25,23,0.1)] backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      role="region"
      aria-label="Purchase actions"
    >
      <div className="mx-auto w-full max-w-7xl px-4 pt-3">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-stone-500">Your design</p>
            <p className="font-display text-[1.65rem] leading-none text-stone-900">{formatPrice(totalPrice)}</p>
          </div>
        </div>
        <Button
          size="lg"
          disabled={adding || !isCustomizationComplete(selection)}
          className="h-14 w-full text-base font-semibold"
          onClick={() => void handleAddToCart()}
        >
          {adding ? "Adding to cart..." : "Add to Cart"}
        </Button>
      </div>
    </div>,
    document.body,
  );
}
