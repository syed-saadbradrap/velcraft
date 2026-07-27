import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, className, id, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.28em] text-stone-500">{label}</span>
      <input
        id={inputId}
        className={cn(
          "h-14 w-full rounded-2xl border border-border bg-stone-950/60 px-5 text-sm text-white outline-none transition focus:border-accent",
          className,
        )}
        {...props}
      />
    </label>
  );
}
