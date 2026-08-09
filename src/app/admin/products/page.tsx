"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminBadge } from "@/components/admin/AdminBadge";
import { AdminAlert, AdminEmptyState, AdminLoading } from "@/components/admin/AdminFeedback";
import { AdminPage, AdminPageHeader, AdminPanel } from "@/components/admin/AdminPage";
import { AdminTable, AdminTableCell, AdminTableHead, AdminTableRow } from "@/components/admin/AdminTable";
import { getErrorMessage } from "@/lib/api/auth-client";
import { getAdminListItems } from "@/lib/admin/list-items";
import { apiClient } from "@/lib/api/client";
import { AdminProductThumbnail } from "@/components/admin/AdminProductThumbnail";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";
import type { AdminShoe } from "@/types/commerce";
import type { CollectionSummary } from "@/types/api";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminShoe[]>([]);
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [search, setSearch] = useState("");
  const [collectionFilter, setCollectionFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([apiClient.getAdminCollections(), apiClient.getAdminShoes({ per_page: 100 })])
      .then(([collectionList, response]) => {
        setCollections(collectionList);
        setProducts(getAdminListItems(response));
        setError("");
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function reloadProducts(nextSearch = search, nextCollection = collectionFilter) {
    try {
      const response = await apiClient.getAdminShoes({
        search: nextSearch || undefined,
        collection_id: nextCollection ? Number(nextCollection) : undefined,
        per_page: 100,
      });
      setProducts(getAdminListItems(response));
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleToggleActive(product: AdminShoe) {
    try {
      const updated = await apiClient.updateAdminShoe(product.id, {
        is_active: !product.is_active,
      });
      setProducts((current) => current.map((item) => (item.id === product.id ? updated : item)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDelete(product: AdminShoe) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }

    try {
      await apiClient.deleteAdminShoe(product.id);
      setProducts((current) => current.filter((item) => item.id !== product.id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Products"
        description="Manage catalog products, collections, pricing, and visibility."
        action={<Button href="/admin/products/new">Add Product</Button>}
      />

      <AdminPanel className="mt-8">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <Input
          label="Search"
          name="search"
          value={search}
          placeholder="Search by name or slug"
          onChange={(event) => setSearch(event.target.value)}
        />
        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-700">Collection</span>
          <select
            value={collectionFilter}
            onChange={(event) => setCollectionFilter(event.target.value)}
            className="h-14 w-full rounded-2xl border border-border bg-white px-5 text-base text-stone-900 outline-none transition focus:border-accent shadow-sm"
          >
            <option value="">All collections</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </label>
        </div>

        <div className="mt-4">
          <Button type="button" variant="ghost" onClick={() => void reloadProducts()}>
            Apply Filters
          </Button>
        </div>
      </AdminPanel>

      <div className="mt-6 space-y-6">
      {error ? <AdminAlert message={error} /> : null}
      {loading ? <AdminLoading label="Loading products..." /> : null}
      {!loading && products.length === 0 ? (
        <AdminEmptyState title="No products found" description="Try changing filters or add a new product." />
      ) : null}

      {!loading && products.length > 0 ? (
      <>
      <div className="mt-8 space-y-4 lg:hidden">
        {products.map((product) => (
          <article
            key={product.id}
            className="rounded-[1.5rem] border border-border bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-stone-100">
                <AdminProductThumbnail product={product} />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/products/${product.id}`}
                  className="block truncate font-medium text-stone-900 hover:text-accent"
                >
                  {product.name}
                </Link>
                <p className="mt-1 truncate text-xs text-stone-500">{product.slug}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-accent">{formatPrice(product.base_price)}</span>
                  <span className="text-stone-400">•</span>
                  <span className="text-stone-600">{product.collection?.name ?? "Unassigned"}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <AdminBadge tone={product.is_active ? "success" : "neutral"}>
                    {product.is_active ? "Active" : "Hidden"}
                  </AdminBadge>
                  {product.is_featured ? <AdminBadge tone="accent">Featured</AdminBadge> : null}
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => router.push(`/admin/products/${product.id}`)}
                className="rounded-full border border-border px-3 py-2.5 text-[10px] uppercase tracking-[0.14em] text-stone-700"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => void handleToggleActive(product)}
                className="rounded-full border border-border px-3 py-2.5 text-[10px] uppercase tracking-[0.14em] text-stone-700"
              >
                {product.is_active ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(product)}
                className="rounded-full border border-red-200 px-3 py-2.5 text-[10px] uppercase tracking-[0.14em] text-red-600"
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <AdminTable className="mt-8 hidden lg:block">
          <AdminTableHead>
            <AdminTableRow>
              <AdminTableCell header>Product</AdminTableCell>
              <AdminTableCell header>Collection</AdminTableCell>
              <AdminTableCell header>Price</AdminTableCell>
              <AdminTableCell header>Status</AdminTableCell>
              <AdminTableCell header>Actions</AdminTableCell>
            </AdminTableRow>
          </AdminTableHead>
          <tbody>
            {products.map((product) => (
              <AdminTableRow key={product.id}>
                <AdminTableCell>
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-stone-100">
                      <AdminProductThumbnail product={product} />
                    </div>
                    <div>
                      <Link href={`/admin/products/${product.id}`} className="font-medium text-stone-900 hover:text-accent">
                        {product.name}
                      </Link>
                      <p className="mt-1 text-xs text-stone-500">{product.slug}</p>
                    </div>
                  </div>
                </AdminTableCell>
                <AdminTableCell className="text-stone-600">{product.collection?.name ?? "—"}</AdminTableCell>
                <AdminTableCell className="font-medium text-accent">{formatPrice(product.base_price)}</AdminTableCell>
                <AdminTableCell>
                  <div className="flex flex-wrap gap-2">
                    <AdminBadge tone={product.is_active ? "success" : "neutral"}>
                      {product.is_active ? "Active" : "Hidden"}
                    </AdminBadge>
                    {product.is_featured ? <AdminBadge tone="accent">Featured</AdminBadge> : null}
                  </div>
                </AdminTableCell>
                <AdminTableCell>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => router.push(`/admin/products/${product.id}`)} className="rounded-full border border-border px-3 py-2 text-xs uppercase tracking-[0.16em] text-stone-700 hover:border-accent hover:text-accent">
                      Edit
                    </button>
                    <button type="button" onClick={() => void handleToggleActive(product)} className="rounded-full border border-border px-3 py-2 text-xs uppercase tracking-[0.16em] text-stone-700 hover:border-accent hover:text-accent">
                      {product.is_active ? "Hide" : "Show"}
                    </button>
                    <button type="button" onClick={() => void handleDelete(product)} className="rounded-full border border-red-200 px-3 py-2 text-xs uppercase tracking-[0.16em] text-red-600 hover:border-red-400">
                      Delete
                    </button>
                  </div>
                </AdminTableCell>
              </AdminTableRow>
            ))}
          </tbody>
        </AdminTable>
      </>
      ) : null}
      </div>
    </AdminPage>
  );
}
