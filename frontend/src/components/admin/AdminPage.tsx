import { cn } from "@/lib/utils";

interface AdminPageProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminPage({ children, className }: AdminPageProps) {
  return <div className={cn("mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10", className)}>{children}</div>;
}

interface AdminPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function AdminPageHeader({ eyebrow = "Admin", title, description, action }: AdminPageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between", action && "mb-8")}>
      <div className="max-w-2xl space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">{eyebrow}</p>
        <h1 className="font-display text-3xl font-medium text-stone-900 md:text-4xl">{title}</h1>
        {description ? <p className="text-sm leading-7 text-stone-600 md:text-base">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

interface AdminPanelProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

export function AdminPanel({ children, className, padding = "md" }: AdminPanelProps) {
  const paddingClass = {
    sm: "p-4",
    md: "p-5 sm:p-6",
    lg: "p-6 sm:p-8",
  }[padding];

  return (
    <div
      className={cn(
        "rounded-[1.5rem] border border-border bg-white shadow-[0_18px_50px_rgba(28,25,23,0.04)]",
        paddingClass,
        className,
      )}
    >
      {children}
    </div>
  );
}

interface AdminStatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  trend?: string;
  accent?: boolean;
}

export function AdminStatCard({ label, value, hint, trend, accent }: AdminStatCardProps) {
  return (
    <div className="rounded-[1.35rem] border border-border bg-white p-5 shadow-[0_12px_40px_rgba(28,25,23,0.04)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">{label}</p>
      <p className={cn("mt-3 font-display text-3xl", accent ? "text-accent" : "text-stone-900")}>{value}</p>
      {hint ? <p className="mt-2 text-xs text-stone-500">{hint}</p> : null}
      {trend ? <p className="mt-2 text-xs font-medium text-emerald-700">{trend}</p> : null}
    </div>
  );
}

export function AdminSectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="font-display text-xl text-stone-900">{title}</h2>
      {action}
    </div>
  );
}
