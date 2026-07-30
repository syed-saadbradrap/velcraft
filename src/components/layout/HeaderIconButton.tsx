"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeaderIconButtonProps {
  href?: string;
  onClick?: () => void;
  label: string;
  count?: number;
  children: React.ReactNode;
  className?: string;
}

const iconClassName =
  "relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-stone-100/[0.03] text-stone-600 transition hover:border-accent/30 hover:bg-accent/5 hover:text-stone-900";

export function HeaderIconButton({
  href,
  onClick,
  label,
  count = 0,
  children,
  className,
}: HeaderIconButtonProps) {
  const ariaLabel = count > 0 ? `${label}, ${count} items` : label;
  const content = (
    <>
      {children}
      <AnimatePresence>
        {count > 0 ? (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-stone-950"
          >
            {count > 9 ? "9+" : count}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </>
  );

  return (
    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
      {onClick ? (
        <button type="button" aria-label={ariaLabel} onClick={onClick} className={cn(iconClassName, className)}>
          {content}
        </button>
      ) : (
        <Link href={href ?? "#"} aria-label={ariaLabel} className={cn(iconClassName, className)}>
          {content}
        </Link>
      )}
    </motion.div>
  );
}
