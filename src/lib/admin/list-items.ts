import type { PaginatedAdmin } from "@/types/commerce";

type NestedPaginatorItems<T> = {
  data?: T[];
};

export function getAdminListItems<T>(response: PaginatedAdmin<T> | null | undefined): T[] {
  const items = response?.items;

  if (Array.isArray(items)) {
    return items;
  }

  if (items && typeof items === "object" && Array.isArray((items as NestedPaginatorItems<T>).data)) {
    return (items as NestedPaginatorItems<T>).data ?? [];
  }

  return [];
}
