import { cn } from "@/lib/utils";

export function AdminTable({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-x-auto rounded-[1.5rem] border border-border bg-white", className)}>
      <table className="min-w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function AdminTableHead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-border bg-stone-50/80 text-[11px] uppercase tracking-[0.18em] text-stone-500">
      {children}
    </thead>
  );
}

export function AdminTableRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn("border-b border-border last:border-b-0", className)}>{children}</tr>;
}

export function AdminTableCell({
  children,
  className,
  header,
}: {
  children: React.ReactNode;
  className?: string;
  header?: boolean;
}) {
  const Tag = header ? "th" : "td";
  return (
    <Tag className={cn(header ? "px-4 py-4 font-medium" : "px-4 py-4 align-middle", className)}>{children}</Tag>
  );
}

export function AdminFilterPills<T extends string>({
  options,
  value,
  onChange,
  allLabel = "All",
}: {
  options: T[];
  value: T | "";
  onChange: (value: T | "") => void;
  allLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange("")}
        className={cn(
          "rounded-full border px-4 py-2 text-xs uppercase tracking-[0.14em] transition",
          value === "" ? "border-accent bg-accent/10 text-accent" : "border-border text-stone-600 hover:border-accent/30",
        )}
      >
        {allLabel}
      </button>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "rounded-full border px-4 py-2 text-xs capitalize tracking-[0.08em] transition",
            value === option
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-stone-600 hover:border-accent/30",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
