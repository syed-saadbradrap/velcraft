import Image from "next/image";
import Link from "next/link";
import type { ShoeSummary } from "@/types/api";
import { isCustomizableShoe, customizeUrl } from "@/lib/catalog/purchase";
import { shoeImageUrl } from "@/lib/media";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { WishlistButton } from "@/components/wishlist/WishlistButton";

interface ShoeCardProps {
  shoe: ShoeSummary;
  className?: string;
  priority?: boolean;
  featured?: boolean;
  variant?: "default" | "slider";
}

export function ShoeCard({
  shoe,
  className,
  priority = false,
  featured = false,
  variant = "default",
}: ShoeCardProps) {
  const imageUrl = shoeImageUrl(shoe);
  const customizable = isCustomizableShoe(shoe.slug);
  const isSlider = variant === "slider";

  return (
    <article
      id={isSlider ? undefined : shoe.slug}
      className={cn(
        "glass-panel glass-panel-hover group flex h-full flex-col overflow-hidden rounded-[1.75rem]",
        featured && "border-accent/20",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-[linear-gradient(180deg,#f5f0e8_0%,#e8e2d8_100%)]",
          isSlider ? "h-[220px] sm:h-[240px] xl:h-[252px]" : "aspect-[5/4]",
        )}
      >
        <Link href={`/collection/shoes/${shoe.slug}`} className="relative block h-full w-full">
          <Image
            src={imageUrl}
            alt={shoe.name}
            fill
            priority={priority}
            sizes={
              isSlider
                ? "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            }
            className={cn(
              "object-contain object-bottom transition duration-700 group-hover:scale-[1.05]",
              isSlider ? "px-4 pb-3 pt-5 sm:px-5 sm:pb-4 sm:pt-6" : "px-5 pb-4 pt-6 sm:px-6 sm:pb-5 sm:pt-7",
            )}
          />
        </Link>

        {customizable ? (
          <span className="absolute left-3 top-3 rounded-full border border-accent/30 bg-white/90 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-accent backdrop-blur sm:left-4 sm:top-4 sm:px-3 sm:text-[10px]">
            {featured ? "Signature Atelier" : "Custom Atelier"}
          </span>
        ) : null}

        <WishlistButton shoe={shoe} size="sm" className="absolute right-3 top-3 sm:right-4 sm:top-4" />
      </div>

      <div className={cn("flex flex-1 flex-col gap-3", isSlider ? "p-5" : "gap-4 p-6")}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.24em] text-stone-600 sm:text-xs">
              {shoe.collection?.name ?? "Collection"}
            </p>
            <h3
              className={cn(
                "mt-1.5 font-display leading-tight text-stone-900",
                isSlider ? "text-xl sm:text-2xl" : "mt-2 text-2xl sm:text-3xl",
              )}
            >
              {shoe.name}
            </h3>
          </div>
          <p className="shrink-0 text-right">
            <span className="block text-[10px] uppercase tracking-[0.2em] text-stone-600">From</span>
            <span className={cn("luxury-gradient font-medium", isSlider ? "text-base sm:text-lg" : "text-lg sm:text-xl")}>
              {formatPrice(shoe.base_price)}
            </span>
          </p>
        </div>

        {!isSlider && shoe.description ? (
          <p className="line-clamp-2 text-sm leading-7 text-stone-600">{shoe.description}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1 sm:gap-3 sm:pt-2">
          <AddToCartButton shoe={shoe} size="sm" variant="primary" />
          <Button href={`/collection/shoes/${shoe.slug}`} variant="secondary" size="sm">
            View Product
          </Button>
          {customizable ? (
            <Button href={customizeUrl()} variant="ghost" size="sm">
              Open Atelier
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
