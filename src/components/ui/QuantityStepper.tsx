"use client";

import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  disabled?: boolean;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
  disabled = false,
}: QuantityStepperProps) {
  function decrease() {
    if (value > min) {
      onChange(value - 1);
    }
  }

  function increase() {
    if (value < max) {
      onChange(value + 1);
    }
  }

  return (
    <div
      className={cn(
        "inline-flex items-center overflow-hidden rounded-full border border-stone-200 bg-white",
        disabled && "opacity-60",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={decrease}
        className="inline-flex h-9 w-9 items-center justify-center text-lg text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-300"
      >
        −
      </button>
      <span className="min-w-10 border-x border-stone-200 px-2 text-center text-sm font-semibold text-stone-900">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={increase}
        className="inline-flex h-9 w-9 items-center justify-center text-lg text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-300"
      >
        +
      </button>
    </div>
  );
}
