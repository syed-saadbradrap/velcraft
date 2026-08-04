"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import { AdminProductThumbnail } from "@/components/admin/AdminProductThumbnail";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatPrice } from "@/lib/utils";
import type { AdminShoe } from "@/types/commerce";
import type { CollectionSummary } from "@/types/api";

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminShoe[]>([]);
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [search, setSearch] = useState("");
  const [collectionFilter, setCollectionFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([apiClient.getAdminCollections(), apiClient.getAdminShoes({ per_page: 100 })])
      .then(([collectionList, response]) => {
        setCollections(collectionList);
        setProducts(response.items);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  async function reloadProducts(nextSearch = search, nextCollection = collectionFilter) {
    try {
      const response = await apiClient.getAdminShoes({
        search: nextSearch || undefined,
        collection_id: nextCollection ? Number(nextCollection) : undefined,
        per_page: 100,
      });
      setProducts(response.items);
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
    <Container className="py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow="Admin"
          title="Products"
          description="Manage catalog products, collections, pricing, and visibility."
        />
        <Button href="/admin/products/new">Add Product</Button>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_220px]">
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
        <Button
          type="button"
          variant="ghost"
          onClick={() => void reloadProducts()}
        >
          Apply Filters
        </Button>
      </div>

      {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

      <div className="mt-8 overflow-x-auto rounded-[1.5rem] border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-stone-100/5 text-xs uppercase tracking-[0.18em] text-stone-600">
            <tr>
              <th className="px-4 py-4">Product</th>
              <th className="px-4 py-4">Collection</th>
              <th className="px-4 py-4">Price</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t border-border">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-stone-100">
                      <AdminProductThumbnail product={product} />
                    </div>
                    <div>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-medium text-stone-900 hover:text-accent"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-xs text-stone-500">{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-stone-600">{product.collection?.name ?? "—"}</td>
                <td className="px-4 py-4 text-accent">{formatPrice(product.base_price)}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-col gap-1">
                    <span className={product.is_active ? "text-emerald-700" : "text-stone-500"}>
                      {product.is_active ? "Active" : "Hidden"}
                    </span>
                    {product.is_featured ? (
                      <span className="text-xs uppercase tracking-[0.16em] text-accent">Featured</span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/products/${product.id}`)}
                      className="rounded-full border border-border px-3 py-2 text-xs uppercase tracking-[0.16em] text-stone-700 hover:border-accent hover:text-accent"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleToggleActive(product)}
                      className="rounded-full border border-border px-3 py-2 text-xs uppercase tracking-[0.16em] text-stone-700 hover:border-accent hover:text-accent"
                    >
                      {product.is_active ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(product)}
                      className="rounded-full border border-red-200 px-3 py-2 text-xs uppercase tracking-[0.16em] text-red-600 hover:border-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
