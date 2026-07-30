"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { CollectionSummary, PaginatedShoes } from "@/types/api";
import { ShoeCard } from "@/components/catalog/ShoeCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface CollectionCatalogProps {
  collections: CollectionSummary[];
  catalog: PaginatedShoes;
  activeCollection?: string;
}

export function CollectionCatalog({
  collections,
  catalog,
  activeCollection,
}: CollectionCatalogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { current_page: currentPage, last_page: lastPage } = catalog.pagination;

  function updateParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(next).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`/collection?${params.toString()}`);
  }

  function setCollection(slug?: string) {
    updateParams({ collection: slug, page: undefined });
  }

  function setPage(page: number) {
    updateParams({ page: String(page) });
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-wrap gap-3"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setCollection()}
            className={cn(
              "rounded-full border px-5 py-2.5 text-sm uppercase tracking-[0.18em] transition",
              !activeCollection
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-stone-700 hover:text-stone-900",
            )}
          >
            All
          </motion.button>
          {collections.map((collection) => (
            <motion.button
              key={collection.id}
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCollection(collection.slug)}
              className={cn(
                "rounded-full border px-5 py-2.5 text-sm uppercase tracking-[0.18em] transition",
                activeCollection === collection.slug
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-stone-700 hover:text-stone-900",
              )}
            >
              {collection.name}
            </motion.button>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-stone-600"
        >
          {catalog.pagination.total} styles in the Velcraft collection
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        {catalog.items.length > 0 ? (
          <motion.div
            key={`${activeCollection ?? "all"}-${currentPage}`}
            variants={staggerContainer(0.06, 0.02)}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: 8 }}
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {catalog.items.map((shoe, index) => (
              <motion.div key={shoe.id} variants={staggerItem}>
                <ShoeCard shoe={shoe} priority={index < 3} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-[1.5rem] border border-border bg-stone-100/[0.03] p-10 text-center"
          >
            <p className="font-display text-3xl text-stone-900">New arrivals coming soon</p>
            <p className="mt-3 text-sm text-stone-700">
              Our atelier is preparing the next collection. Contact concierge for private previews.
            </p>
            <Button href="/contact" variant="secondary" size="sm" className="mt-6">
              Contact Concierge
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {lastPage > 1 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8"
        >
          <p className="text-sm text-stone-600">
            Page {currentPage} of {lastPage}
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage >= lastPage}
              onClick={() => setPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
