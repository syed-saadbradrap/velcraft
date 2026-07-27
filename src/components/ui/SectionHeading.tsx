import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  action?: React.ReactNode;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  action,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl space-y-5",
        align === "center" && "mx-auto text-center",
        action && "flex w-full max-w-none flex-col gap-8 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className={cn("space-y-5", align === "center" && "mx-auto")}>
        {eyebrow ? (
          <div className={cn("space-y-3", align === "center" && "flex flex-col items-center")}>
            <p className="text-xs uppercase tracking-[0.35em] text-accent">{eyebrow}</p>
            <div className={cn("gold-divider w-16", align === "center" && "mx-auto")} />
          </div>
        ) : null}
        <h2 className="font-display text-4xl font-medium leading-[1.08] text-white md:text-5xl lg:text-[3.25rem]">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-base leading-8 text-stone-400 md:text-lg">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
