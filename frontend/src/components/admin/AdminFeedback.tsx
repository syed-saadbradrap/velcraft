import { cn } from "@/lib/utils";

export function AdminAlert({ message, tone = "error" }: { message: string; tone?: "error" | "success" }) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        tone === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800",
      )}
    >
      {message}
    </div>
  );
}

export function AdminLoading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3 text-sm text-stone-600">
      <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
      {label}
    </div>
  );
}

export function AdminEmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-border bg-stone-50/80 px-6 py-12 text-center">
      <p className="font-display text-xl text-stone-900">{title}</p>
      {description ? <p className="mt-2 text-sm text-stone-600">{description}</p> : null}
    </div>
  );
}
