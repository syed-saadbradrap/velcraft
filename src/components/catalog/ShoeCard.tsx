import Image from "next/image";
import Link from "next/link";
import type { ShoeSummary } from "@/types/api";
import { isCustomizableShoe } from "@/lib/catalog/purchase";
import { shoeImageUrl } from "@/lib/media";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { WishlistButton } from "@/components/wishlist/WishlistButton";

interface ShoeCardProps {
  shoe: ShoeSummary;
  className?: string;
  priority?: boolean;
  featured?: boolean;
  variant?: "default" | "slider";
}

function IconLinkButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 transition hover:border-accent/30 hover:text-accent"
    >
      {children}
    </Link>
  );
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
  const productHref = `/collection/shoes/${shoe.slug}`;

  return (
    <article
      id={isSlider ? undefined : shoe.slug}
      className={cn(
        "group flex h-full min-w-0 max-w-full flex-col overflow-hidden rounded-[1.5rem] border bg-white transition duration-500",
        isSlider
          ? "border-stone-200/90 shadow-[0_12px_32px_rgba(28,25,23,0.06)] hover:-translate-y-1 hover:border-accent/25 hover:shadow-[0_20px_48px_rgba(28,25,23,0.1)]"
          : "glass-panel glass-panel-hover rounded-[1.75rem]",
        featured && "ring-1 ring-accent/20",
        className,
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden",
          isSlider
            ? "h-[210px] bg-white sm:h-[228px] xl:h-[240px]"
            : "aspect-[5/4] bg-white",
        )}
      >
        <Link href={productHref} className="relative block h-full w-full">
          <Image
            src={imageUrl}
            alt={shoe.name}
            fill
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
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
          <span className="absolute left-3 top-3 rounded-full border border-accent/25 bg-white/95 px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] text-accent shadow-sm backdrop-blur sm:left-4 sm:top-4 sm:px-3 sm:text-[10px]">
            {featured ? "Signature Style" : "Customizable"}
          </span>
        ) : null}

        <WishlistButton shoe={shoe} size="sm" className="absolute right-3 top-3 sm:right-4 sm:top-4" />
      </div>

      <div className={cn("flex flex-1 flex-col", isSlider ? "gap-3 p-4 sm:gap-4 sm:p-5" : "gap-4 p-4 sm:p-6")}>
        {isSlider ? (
          <>
            <div className="min-w-0 space-y-2">
              <p className="text-[10px] uppercase tracking-[0.24em] text-stone-500">
                {shoe.collection?.name ?? "Collection"}
              </p>
              <h3 className="break-words font-display text-lg leading-tight text-stone-900 sm:text-xl">
                <Link href={productHref} className="transition hover:text-accent">
                  {shoe.name}
                </Link>
              </h3>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-stone-100 pt-3">
              <span className="shrink-0 text-[10px] uppercase tracking-[0.22em] text-stone-500">Starting at</span>
              <span className="luxury-gradient truncate font-display text-lg font-medium sm:text-xl">
                {formatPrice(shoe.base_price)}
              </span>
            </div>

            <div className="mt-auto flex min-w-0 items-center gap-2 pt-1">
              <AddToCartButton shoe={shoe} size="sm" variant="primary" className="min-w-0 flex-1" fullWidth />
              <IconLinkButton href={productHref} label="View product">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </IconLinkButton>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.24em] text-stone-600 sm:text-xs">
                  {shoe.collection?.name ?? "Collection"}
                </p>
                <h3 className="mt-1.5 break-words font-display text-xl leading-tight text-stone-900 sm:text-2xl md:text-3xl">
                  <Link href={productHref} className="transition hover:text-accent">
                    {shoe.name}
                  </Link>
                </h3>
              </div>
              <p className="shrink-0 text-right">
                <span className="block text-[10px] uppercase tracking-[0.2em] text-stone-600">From</span>
                <span className="luxury-gradient text-lg font-medium sm:text-xl">{formatPrice(shoe.base_price)}</span>
              </p>
            </div>

            {shoe.description ? (
              <p className="line-clamp-2 text-sm leading-7 text-stone-600">{shoe.description}</p>
            ) : null}

            <div className="mt-auto flex items-center gap-2 pt-1 sm:pt-2">
              <AddToCartButton shoe={shoe} size="sm" variant="primary" className="flex-1" fullWidth />
              <IconLinkButton href={productHref} label="View product">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </IconLinkButton>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
