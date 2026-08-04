"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import { ProductForm, createEmptyShoeForm } from "@/components/admin/ProductForm";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
      <Container className="py-10 lg:py-14">
        <p className="text-sm text-red-600">{error}</p>
      </Container>
    );
  }

  if (!options) {
    return (
      <Container className="py-10 lg:py-14">
        <p className="text-sm text-stone-600">Loading product form...</p>
      </Container>
    );
  }

  const defaultForm = createEmptyShoeForm();
  const menCollection = collections.find((collection) => collection.slug === "men");
  if (menCollection) {
    defaultForm.collection_id = menCollection.id;
  }

  return (
    <Container className="py-10 lg:py-14">
      <SectionHeading
        eyebrow="Admin"
        title="Add Product"
        description="Create a new catalog product and assign it to a collection."
      />

      <ProductForm
        collections={collections}
        options={options}
        initialValues={defaultForm}
        submitLabel="Create Product"
        onCancel={() => router.push("/admin/products")}
        onSubmit={async (values) => {
          const created = await apiClient.createAdminShoe(values);
          router.push(`/admin/products/${created.id}`);
        }}
      />
    </Container>
  );
}
