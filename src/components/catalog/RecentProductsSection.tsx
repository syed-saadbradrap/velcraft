import type { ShoeSummary } from "@/types/api";
import { ShoeCard } from "@/components/catalog/ShoeCard";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface RecentProductsSectionProps {
  products: ShoeSummary[];
  collectionName?: string;
}

export function RecentProductsSection({ products, collectionName }: RecentProductsSectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-border pt-14 sm:mt-20 sm:pt-16 lg:mt-24">
      <div className="mb-8 flex flex-col gap-6 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="You May Also Like"
          title="Recent styles"
          description={
            collectionName
              ? `More from our ${collectionName.toLowerCase()} collection, ready to order in your size.`
              : "Explore more curated silhouettes from our latest collection."
          }
          className="mb-0"
        />
        <Button href="/collection" variant="secondary" size="sm" className="shrink-0 self-start sm:self-auto">
          View All
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product, index) => (
          <ShoeCard key={product.id} shoe={product} priority={index < 2} />
        ))}
      </div>
    </section>
  );
}
