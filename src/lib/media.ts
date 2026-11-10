import { siteConfig } from "@/config/site";
import { catalogProducts, catalogGalleryPaths, catalogThumbnailPath } from "@/lib/catalog/products";

export function storageImageUrl(path?: string | null): string {
  if (!path) {
    return "";
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const apiBase = siteConfig.apiUrl.replace(/\/api\/v1$/, "");
  return `${apiBase}/storage/${cleanPath}`;
}

export function adminProductThumbnailSources(shoe: {
  slug: string;
  thumbnail_url?: string | null;
  thumbnail_path?: string | null;
}): string[] {
  const sources = [
    storageImageUrl(shoe.thumbnail_path ?? null),
    shoe.thumbnail_url ?? "",
    normalizeImageUrl(catalogThumbnailPath(shoe.slug)),
    "/images/shoes/placeholder.svg",
  ];

  return [...new Set(sources.filter((source) => source.length > 0))];
}

export function normalizeImageUrl(url?: string | null, fallback?: string | null): string {
  const candidate = url && url.length > 0 ? url : fallback;
  if (!candidate) {
    return "";
  }

  if (candidate.startsWith("/images/")) {
    return candidate;
  }

  if (candidate.startsWith("images/")) {
    return `/${candidate}`;
  }

  const storagePattern = /\/storage\/images\/(.+)$/i;
  const relativeMatch = candidate.match(storagePattern);
  if (relativeMatch) {
    return `/images/${relativeMatch[1]}`;
  }

  try {
    const parsed = new URL(candidate, "http://localhost");
    const absoluteMatch = parsed.pathname.match(storagePattern);
    if (absoluteMatch) {
      return `/images/${absoluteMatch[1]}`;
    }

    if (parsed.pathname.startsWith("/images/")) {
      return parsed.pathname;
    }
  } catch {
    return candidate.startsWith("/") ? candidate : "";
  }

  return candidate.startsWith("/") || candidate.startsWith("http://") || candidate.startsWith("https://")
    ? candidate
    : "";
}

const shoeImageFallbacks: Record<string, string> = Object.fromEntries(
  catalogProducts.map((product) => [product.slug, catalogThumbnailPath(product.slug)]),
);

shoeImageFallbacks["ivory-gold-bit-mule"] = "/images/shoes/ivory-gold-bit-mule.webp";

export function shoeImageUrl(shoe: { slug: string; thumbnail_url?: string | null }) {
  const normalized = normalizeImageUrl(shoe.thumbnail_url);
  if (normalized) {
    return normalized;
  }

  return shoeImageFallbacks[shoe.slug] ?? catalogThumbnailPath(shoe.slug);
}

export function shoeGalleryUrls(shoe: { slug: string; thumbnail_url?: string | null }) {
  const catalogPaths = catalogGalleryPaths(shoe.slug);
  const normalizedCatalog = catalogPaths
    .map((path) => normalizeImageUrl(path))
    .filter((url) => url.length > 0);

  if (normalizedCatalog.length > 0) {
    return [...new Set(normalizedCatalog)];
  }

  const primary = shoeImageUrl(shoe);
  return primary ? [primary] : [];
}
