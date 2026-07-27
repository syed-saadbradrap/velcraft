import type { Metadata } from "next";
import { Suspense } from "react";
import { apiClient } from "@/lib/api/client";
import { CollectionCatalog } from "@/components/catalog/CollectionCatalog";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ShoeCardSkeleton } from "@/components/ui/Skeleton";
export const metadata: Metadata = {
  title: "Collection",
  description: "Browse curated shoe silhouettes ready for bespoke customization.",
};

interface CollectionPageProps {
  searchParams: Promise<{ collection?: string; page?: string }>;
}

export default async function CollectionPage({ searchParams }: CollectionPageProps) {
  const params = await searchParams;
  const activeCollection = params.collection;
  const page = Number(params.page ?? "1");

  const [collections, catalog] = await Promise.all([
    apiClient.getCollections(),
    apiClient.getShoes(activeCollection, page),
  ]);

  return (
    <Container className="py-24">
      <div className="space-y-12">
        <SectionHeading
          eyebrow="Collection"
          title="Signature silhouettes, ready to order"
          description="Browse our curated mules — view details, select your size, and add to cart. The Ivory Gold Bit Mule opens in our exclusive atelier studio."
        />

        <Suspense
          fallback={
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <ShoeCardSkeleton key={index} />
              ))}
            </div>
          }
        >          <CollectionCatalog
            collections={collections}
            catalog={catalog}
            activeCollection={activeCollection}
          />
        </Suspense>
      </div>
    </Container>
  );
}
