import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  const textareaId = id ?? props.name;

  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.28em] text-stone-500">{label}</span>
      <textarea
        id={textareaId}
        className={cn(
          "min-h-40 w-full rounded-2xl border border-border bg-stone-950/60 px-5 py-4 text-sm text-white outline-none transition focus:border-accent",
          className,
        )}
        {...props}
      />
    </label>
  );
}
