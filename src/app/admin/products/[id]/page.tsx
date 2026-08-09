"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import { AdminLoading } from "@/components/admin/AdminFeedback";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";
import { ProductForm, shoeToForm } from "@/components/admin/ProductForm";
import type { AdminProductOptions, AdminShoe } from "@/types/commerce";
import type { CollectionSummary } from "@/types/api";

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = Number(params.id);

  const [product, setProduct] = useState<AdminShoe | null>(null);
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [options, setOptions] = useState<AdminProductOptions | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Number.isFinite(productId)) {
      setError("Invalid product id.");
      return;
    }

    void Promise.all([
      apiClient.getAdminShoe(productId),
      apiClient.getAdminCollections(),
      apiClient.getAdminProductOptions(),
    ])
      .then(([shoe, collectionList, productOptions]) => {
        setProduct(shoe);
        setCollections(collectionList);
        setOptions(productOptions);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, [productId]);

  if (error) {
    return (
      <AdminPage>
        <p className="text-sm text-red-600">{error}</p>
      </AdminPage>
    );
  }

  if (!product || !options) {
    return (
      <AdminPage>
        <AdminLoading label="Loading product..." />
      </AdminPage>
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Edit Product"
        description={`Update ${product.name} pricing, collection, thumbnail, and options.`}
      />

      <ProductForm
        collections={collections}
        options={options}
        initialValues={shoeToForm(product)}
        submitLabel="Save Changes"
        onCancel={() => router.push("/admin/products")}
        onRefreshOptions={async () => {
          const productOptions = await apiClient.getAdminProductOptions();
          setOptions(productOptions);
        }}
        onSubmit={async (values) => {
          const updated = await apiClient.updateAdminShoe(product.id, values);
          setProduct(updated);
          router.push("/admin/products");
        }}
      />
    </AdminPage>
  );
}
