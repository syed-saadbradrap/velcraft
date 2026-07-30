"use client";

import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
}

export function ThemeToggle({ className, compact = false }: ThemeToggleProps) {
  const { theme, toggleTheme, ready } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      disabled={!ready}
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-stone-200 bg-stone-100/[0.03] text-stone-600 transition hover:border-accent/30 hover:text-stone-900 disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-300 dark:hover:text-stone-50",
        compact ? "h-10 w-10" : "h-11 w-11",
        className,
      )}
    >
      <span className="relative h-5 w-5">
        <svg
          viewBox="0 0 24 24"
          className={cn(
            "absolute inset-0 h-5 w-5 transition-all duration-300",
            isDark ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100",
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
        <svg
          viewBox="0 0 24 24"
          className={cn(
            "absolute inset-0 h-5 w-5 transition-all duration-300",
            isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0",
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <path d="M21 14.5A8.5 8.5 0 1114.5 3a6.5 6.5 0 008.5 11.5z" />
        </svg>
      </span>
    </button>
  );
}
