import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-stone-200/70", className)} />;
}

export function ShoeCardSkeleton() {
  return (
    <div className="glass-panel overflow-hidden rounded-[1.75rem]">
      <Skeleton className="aspect-[4/5] rounded-none" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ViewerSkeleton() {
  return (
    <div className="relative h-[100vh] min-h-[100vh] overflow-hidden rounded-[2rem] border border-border bg-[radial-gradient(circle_at_center,#f5f3ef_0%,#faf8f5_70%)]">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-stone-900/[0.03] via-transparent to-accent/10" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
        <p className="text-xs uppercase tracking-[0.32em] text-stone-600">Preparing Atelier Studio</p>
      </div>
    </div>
  );
}
