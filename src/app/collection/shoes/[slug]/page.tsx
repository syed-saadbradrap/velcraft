import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { shoeImageUrl } from "@/lib/media";
import { formatPrice } from "@/lib/utils";
import { StandardPurchasePanel } from "@/components/catalog/StandardPurchasePanel";
import { isCustomizableShoe } from "@/lib/catalog/purchase";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

interface ShoeDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ShoeDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const shoe = await apiClient.getShoe(slug);

  if (!shoe) {
    return { title: "Shoe Not Found" };
  }

  const image = shoeImageUrl(shoe);

  return {
    title: shoe.name,
    description: shoe.description ?? undefined,
    openGraph: {
      title: shoe.name,
      description: shoe.description ?? undefined,
      images: [{ url: image, alt: shoe.name }],
    },
  };
}

export default async function ShoeDetailPage({ params }: ShoeDetailPageProps) {
  const { slug } = await params;
  const shoe = await apiClient.getShoe(slug);

  if (!shoe) {
    notFound();
  }

  const imageUrl = shoeImageUrl(shoe);
  const customizable = isCustomizableShoe(shoe.slug);

  return (
    <Container className="py-24">
      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div className="glass-panel relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,#f5f0e8_0%,#e8e2d8_100%)]">
          <Image
            src={imageUrl}
            alt={shoe.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-contain p-10"
          />
        </div>

        <div className="space-y-8">
          <div>
            <Link
              href="/collection"
              className="text-xs uppercase tracking-[0.28em] text-stone-600 transition hover:text-accent"
            >
              Back to Collection
            </Link>
            <p className="mt-6 text-xs uppercase tracking-[0.28em] text-accent">
              {shoe.collection?.name ?? "Collection"}
            </p>
            <h1 className="mt-3 font-display text-5xl text-stone-900 md:text-6xl">{shoe.name}</h1>
            <p className="mt-4">
              <span className="mr-2 text-sm uppercase tracking-[0.22em] text-stone-600">From</span>
              <span className="luxury-gradient text-3xl">{formatPrice(shoe.base_price)}</span>
            </p>
          </div>

          {shoe.description ? (
            <p className="max-w-2xl text-base leading-8 text-stone-700">{shoe.description}</p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Production", value: "10–14 days" },
              { label: "Sizing", value: "EU Men & Women" },
              { label: "Preview", value: "Live 3D studio" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.25rem] border border-border bg-stone-900/[0.03] p-4"
              >
                <p className="text-[10px] uppercase tracking-[0.24em] text-stone-600">{item.label}</p>
                <p className="mt-2 text-sm text-stone-900">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {shoe.materials && shoe.materials.length > 0 ? (
              <div className="rounded-[1.25rem] border border-border bg-stone-900/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-stone-600">Materials</p>
                <ul className="mt-3 space-y-2 text-sm text-stone-600">
                  {shoe.materials.map((material) => (
                    <li key={material.id}>{material.name}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {shoe.colors && shoe.colors.length > 0 ? (
              <div className="rounded-[1.25rem] border border-border bg-stone-900/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-stone-600">Colors</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {shoe.colors.slice(0, 8).map((color) => (
                    <span
                      key={color.id}
                      className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-stone-600"
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-stone-300/40"
                        style={{ backgroundColor: color.hex_code }}
                      />
                      {color.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {shoe.supported_types && shoe.supported_types.length > 0 ? (
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-stone-600">Available Types</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {shoe.supported_types.map((type) => (
                  <span
                    key={type}
                    className="rounded-full border border-border px-4 py-2 text-sm capitalize text-stone-600"
                  >
                    {type.replace("-", " ")}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-[1.5rem] border border-border bg-stone-900/[0.03] p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-accent">Craftsmanship</p>
            <p className="mt-3 text-sm leading-7 text-stone-700">
              {customizable
                ? "Our signature style is available in the atelier studio for full personalization, or ready to order in its curated finish."
                : "Each pair is finished with premium materials, balanced sole construction, and the Velcraft atelier standard."}
            </p>
          </div>

          <StandardPurchasePanel shoe={shoe} />

          <Button href="/contact" variant="ghost" size="sm" className="text-stone-700">
            Ask Concierge
          </Button>
        </div>
      </div>
    </Container>
  );
}
