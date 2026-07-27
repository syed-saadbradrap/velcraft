"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SectionShell } from "@/components/ui/SectionShell";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { customizeUrl, isCustomizableShoe } from "@/lib/catalog/purchase";
import { shoeImageUrl } from "@/lib/media";
import { formatPrice } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/motion";

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const { items, isLoading, removeWishlist } = useWishlist();

  return (
    <SectionShell tone="default" containerClassName="space-y-12">
      <SectionHeading
        eyebrow="Wishlist"
        title="Your saved silhouettes"
        description="Curate the pairs you love — return anytime to customize, compare, or move them to cart."
        align="center"
      />

      {!isAuthenticated ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-accent/15 bg-accent/5 px-6 py-4 text-center text-sm text-stone-300">
          Sign in to sync your wishlist across devices.{" "}
          <Link href="/login?next=/wishlist" className="text-accent hover:underline">
            Sign in
          </Link>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="glass-panel h-[420px] animate-pulse rounded-[1.75rem]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel mx-auto max-w-xl rounded-[2rem] px-8 py-14 text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-accent/25 bg-accent/10 text-accent">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 20.5s-7-4.6-7-10a4 4 0 017-2.5 4 4 0 017 2.5c0 5.4-7 10-7 10z" />
            </svg>
          </div>
          <h2 className="font-display text-3xl text-white">No saved designs yet</h2>
          <p className="mt-3 text-sm leading-7 text-stone-400">
            Tap the heart on any product to save it here for later.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/collection">Explore Collection</Button>
            <Button href={customizeUrl()} variant="secondary">
              Open Atelier
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer(0.08, 0.04)}
          initial="hidden"
          animate="visible"
          className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
        >
          {items.map((item) => (
            <motion.article
              key={item.shoe_id}
              variants={staggerItem}
              className="glass-panel glass-panel-hover group overflow-hidden rounded-[1.75rem]"
            >
              <div className="relative h-[220px] bg-[linear-gradient(180deg,#f5f0e8_0%,#e8e2d8_100%)]">
                <Link href={`/collection/shoes/${item.shoe.slug}`} className="relative block h-full w-full">
                  <Image
                    src={shoeImageUrl(item.shoe)}
                    alt={item.shoe.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-contain object-bottom px-5 pb-4 pt-6 transition duration-700 group-hover:scale-[1.04]"
                  />
                </Link>
                <WishlistButton shoe={item.shoe} size="sm" className="absolute right-4 top-4" />
              </div>

              <div className="space-y-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">
                      {item.shoe.collection?.name ?? "Collection"}
                    </p>
                    <h2 className="mt-2 font-display text-2xl text-white">{item.shoe.name}</h2>
                  </div>
                  <p className="text-right">
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-stone-500">From</span>
                    <span className="luxury-gradient text-lg font-medium">{formatPrice(item.shoe.base_price)}</span>
                  </p>
                </div>

                <p className="text-xs uppercase tracking-[0.18em] text-stone-600">
                  Saved {new Date(item.created_at).toLocaleDateString()}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {isCustomizableShoe(item.shoe.slug) ? (
                    <Button href={customizeUrl()} size="sm">
                      Open Atelier
                    </Button>
                  ) : (
                    <Button href={`/collection/shoes/${item.shoe.slug}`} size="sm">
                      View Product
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() => void removeWishlist(item.shoe_id)}
                    className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.16em] text-stone-500 transition hover:border-red-400/30 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}

      <p className="text-center text-sm text-stone-500">
        Ready to purchase?{" "}
        <Link href="/cart" className="text-accent hover:underline">
          View your cart
        </Link>
      </p>
    </SectionShell>
  );
}
