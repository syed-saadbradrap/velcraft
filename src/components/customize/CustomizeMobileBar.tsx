"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useCustomization } from "@/context/CustomizationContext";
import { formatPrice } from "@/lib/utils";
import { isCustomizationComplete, selectionToApiCustomization } from "@/types/commerce";
import { Button } from "@/components/ui/Button";

export function CustomizeMobileBar() {
  const { addItem } = useCart();
  const { config, selection, totalPrice } = useCustomization();
  const [adding, setAdding] = useState(false);

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

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-stone-950/95 p-4 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">Your design</p>
          <p className="font-display text-2xl text-accent">{formatPrice(totalPrice)}</p>
        </div>
        <Button size="lg" disabled={adding} onClick={() => void handleAddToCart()}>
          {adding ? "Adding..." : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
