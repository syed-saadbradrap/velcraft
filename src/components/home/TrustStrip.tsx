"use client";

import { Container } from "@/components/ui/Container";

const highlights = [
  { label: "Hand-finished mules", detail: "Artisan made" },
  { label: "Live 3D customization", detail: "Real-time atelier" },
  { label: "Premium suede & leather", detail: "Curated materials" },
  { label: "Signature hardware", detail: "Gold & silver bits" },
  { label: "EU sizing for men & women", detail: "Concierge fit" },
  { label: "White-glove support", detail: "End to end" },
] as const;

export function TrustStrip() {
  const items = [...highlights, ...highlights];

  return (
    <section className="relative overflow-hidden border-y border-border bg-stone-50/90 py-6">
      <div className="absolute inset-x-0 top-0 gold-divider opacity-70" />
      <Container className="relative">
        <div className="mb-4 flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.28em] text-stone-600">
          <span>The Velcraft Standard</span>
          <span className="hidden sm:inline">Crafted for modern luxury</span>
        </div>

        <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <div className="marquee-track gap-10">
            {items.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                className="flex shrink-0 items-center gap-4 px-2"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/20 bg-accent/5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                <div>
                  <p className="whitespace-nowrap text-[11px] uppercase tracking-[0.22em] text-stone-600">
                    {item.label}
                  </p>
                  <p className="whitespace-nowrap text-[10px] tracking-[0.14em] text-stone-600">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
      <div className="absolute inset-x-0 bottom-0 gold-divider opacity-70" />
    </section>
  );
}
