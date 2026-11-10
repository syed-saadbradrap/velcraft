import Link from "next/link";
import type { PolicyDocument, PolicySlug } from "@/lib/content/policies";
import { policyLinks } from "@/lib/content/policies";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

interface PolicyDocumentViewProps {
  document: PolicyDocument;
  activeSlug: PolicySlug;
}

export function PolicyDocumentView({ document, activeSlug }: PolicyDocumentViewProps) {
  return (
    <Container className="py-12 sm:py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
        <aside className="h-fit rounded-[1.5rem] border border-border bg-white p-5 lg:sticky lg:top-28">
          <p className="text-xs uppercase tracking-[0.28em] text-accent">Policies</p>
          <nav className="mt-4 space-y-2">
            {policyLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block rounded-xl px-3 py-2 text-sm transition",
                  link.slug === activeSlug
                    ? "bg-accent/10 font-medium text-accent"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        <article className="min-w-0">
          <header className="border-b border-border pb-8">
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Legal</p>
            <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.25rem)] leading-tight text-stone-900">
              {document.title}
            </h1>
            <p className="mt-3 text-sm text-stone-500">Last updated: {document.updatedAt}</p>
            <p className="mt-6 text-base leading-8 text-stone-700">{document.intro}</p>
          </header>

          <div className="space-y-10 pt-10">
            {document.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-2xl text-stone-900">{section.heading}</h2>
                <div className="mt-4 space-y-4 text-base leading-8 text-stone-700">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.bullets ? (
                    <ul className="list-disc space-y-2 pl-5">
                      {section.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
        </article>
      </div>
    </Container>
  );
}
