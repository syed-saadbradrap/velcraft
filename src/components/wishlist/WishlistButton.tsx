"use client";

import { motion } from "framer-motion";
import type { ShoeSummary } from "@/types/api";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  shoe: ShoeSummary;
  className?: string;
  size?: "sm" | "md";
}

export function WishlistButton({ shoe, className, size = "md" }: WishlistButtonProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const active = isWishlisted(shoe.id);

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void toggleWishlist(shoe);
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-full border backdrop-blur transition-colors",
        size === "sm" ? "h-9 w-9" : "h-10 w-10",
        active
          ? "border-accent/40 bg-accent/15 text-accent"
          : "border-white/10 bg-stone-950/70 text-stone-300 hover:border-accent/30 hover:text-accent",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className={cn(size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]")} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6">
        <path d="M12 20.5s-7-4.6-7-10a4 4 0 017-2.5 4 4 0 017 2.5c0 5.4-7 10-7 10z" />
      </svg>
    </motion.button>
  );
}
