import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";

type SectionTone = "default" | "muted" | "accent";

interface SectionShellProps {
  children: React.ReactNode;
  className?: string;
  tone?: SectionTone;
  containerClassName?: string;
}

const toneClasses: Record<SectionTone, string> = {
  default: "",
  muted: "border-y border-border bg-stone-950/50",
  accent:
    "border-y border-border bg-[linear-gradient(180deg,rgba(201,169,98,0.06),transparent_60%)]",
};

export const SectionShell = forwardRef<HTMLElement, SectionShellProps>(function SectionShell(
  { children, className, tone = "default", containerClassName },
  ref,
) {
  return (
    <section ref={ref} className={cn("relative py-24 md:py-28", toneClasses[tone], className)}>
      <Container className={cn("relative", containerClassName)}>{children}</Container>
    </section>
  );
});
