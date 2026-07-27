"use client";

import { useState } from "react";
import type { ShoeSummary } from "@/types/api";
import { useCart } from "@/context/CartContext";
import { apiClient } from "@/lib/api/client";
import { buildDefaultCustomization } from "@/lib/catalog/purchase";
import { getErrorMessage } from "@/lib/api/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface AddToCartButtonProps {
  shoe: ShoeSummary;
  size?: "sm" | "md";
  variant?: "primary" | "secondary";
  className?: string;
  fullWidth?: boolean;
}

export function AddToCartButton({
  shoe,
  size = "sm",
  variant = "secondary",
  className,
  fullWidth = false,
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [state, setState] = useState<"idle" | "loading" | "added" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleAddToCart(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (state === "loading") {
      return;
    }

    setState("loading");
    setErrorMessage("");

    try {
      const detail = await apiClient.getShoe(shoe.slug);
      if (!detail) {
        throw new Error("Product not found.");
      }

      const customization = buildDefaultCustomization(detail);
      await addItem({
        shoe_id: shoe.id,
        quantity: 1,
        customization,
      });

      setState("added");
      window.setTimeout(() => setState("idle"), 2200);
    } catch (err) {
      setState("error");
      setErrorMessage(getErrorMessage(err, "Unable to add to cart."));
      window.setTimeout(() => {
        setState("idle");
        setErrorMessage("");
      }, 3200);
    }
  }

  const label =
    state === "loading" ? "Adding..." : state === "added" ? "Added ✓" : "Add to Cart";

  return (
    <div className={cn("relative", fullWidth && "w-full", className)}>
      <Button
        type="button"
        size={size}
        variant={state === "added" ? "primary" : variant}
        disabled={state === "loading"}
        onClick={(event) => void handleAddToCart(event)}
        className={cn(fullWidth && "w-full", state === "added" && "border border-accent/40")}
        aria-live="polite"
      >
        {label}
      </Button>
      {state === "error" && errorMessage ? (
        <p className="absolute left-0 top-[calc(100%+6px)] z-10 min-w-[180px] text-[10px] leading-4 text-red-300">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
