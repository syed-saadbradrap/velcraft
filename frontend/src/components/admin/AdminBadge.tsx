import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "accent";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-stone-200 bg-stone-100 text-stone-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  danger: "border-red-200 bg-red-50 text-red-700",
  accent: "border-accent/25 bg-accent/10 text-accent",
};

export function AdminBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function orderStatusTone(status: string): BadgeTone {
  switch (status) {
    case "delivered":
      return "success";
    case "shipped":
    case "processing":
    case "confirmed":
      return "accent";
    case "pending":
      return "warning";
    case "cancelled":
      return "danger";
    default:
      return "neutral";
  }
}

export function messageStatusTone(status: string): BadgeTone {
  switch (status) {
    case "new":
      return "warning";
    case "replied":
      return "success";
    case "read":
      return "accent";
    default:
      return "neutral";
  }
}

export function paymentStatusTone(status: string): BadgeTone {
  switch (status) {
    case "paid":
      return "success";
    case "pending":
      return "warning";
    case "failed":
    case "refunded":
      return "danger";
    default:
      return "neutral";
  }
}
