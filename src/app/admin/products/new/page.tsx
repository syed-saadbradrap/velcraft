"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import { AdminLoading } from "@/components/admin/AdminFeedback";
import { AdminPage, AdminPageHeader } from "@/components/admin/AdminPage";
import { ProductForm, createEmptyShoeForm } from "@/components/admin/ProductForm";
import type { AdminProductOptions } from "@/types/commerce";
import type { CollectionSummary } from "@/types/api";

export default function AdminNewProductPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [options, setOptions] = useState<AdminProductOptions | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([apiClient.getAdminCollections(), apiClient.getAdminProductOptions()])
      .then(([collectionList, productOptions]) => {
        setCollections(collectionList);
        setOptions(productOptions);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) {
    return (
      <AdminPage>
        <p className="text-sm text-red-600">{error}</p>
      </AdminPage>
    );
  }

  if (!options) {
    return (
      <AdminPage>
        <AdminLoading label="Loading product form..." />
      </AdminPage>
    );
  }

  const defaultForm = createEmptyShoeForm();
  const menCollection = collections.find((collection) => collection.slug === "men");
  if (menCollection) {
    defaultForm.collection_id = menCollection.id;
  }

  return (
    <AdminPage>
      <AdminPageHeader title="Add Product" description="Create a new catalog product and assign it to a collection." />

      <ProductForm
        collections={collections}
        options={options}
        initialValues={defaultForm}
        submitLabel="Create Product"
        onCancel={() => router.push("/admin/products")}
        onRefreshOptions={async () => {
          const productOptions = await apiClient.getAdminProductOptions();
          setOptions(productOptions);
        }}
        onSubmit={async (values) => {
          const created = await apiClient.createAdminShoe(values);
          router.push(`/admin/products/${created.id}`);
        }}
      />
    </AdminPage>
  );
}
