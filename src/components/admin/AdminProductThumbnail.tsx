"use client";

import { useMemo, useState } from "react";
import { adminProductThumbnailSources } from "@/lib/media";
import type { AdminShoe } from "@/types/commerce";

interface AdminProductThumbnailProps {
  product: AdminShoe;
}

export function AdminProductThumbnail({ product }: AdminProductThumbnailProps) {
  const sources = useMemo(() => adminProductThumbnailSources(product), [product]);
  const [index, setIndex] = useState(0);
  const src = sources[index];

  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.16em] text-stone-400">
        No image
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={product.name}
      className="h-full w-full object-contain p-1"
      onError={() => {
        setIndex((current) => (current < sources.length - 1 ? current + 1 : current));
      }}
    />
  );
}
