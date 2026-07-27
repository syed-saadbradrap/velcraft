export function normalizeImageUrl(url?: string | null, fallback?: string | null): string {
  const candidate = url && url.length > 0 ? url : fallback;
  if (!candidate) {
    return "";
  }

  if (candidate.startsWith("/images/")) {
    return candidate;
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
  } catch {
    return candidate;
  }

  return candidate;
}

export function shoeImageUrl(shoe: { slug: string; thumbnail_url?: string | null }) {
  const local = `/images/shoes/${shoe.slug}.jpg`;
  const normalized = normalizeImageUrl(shoe.thumbnail_url, local);
  return normalized.startsWith("/images/") ? normalized : local;
}
