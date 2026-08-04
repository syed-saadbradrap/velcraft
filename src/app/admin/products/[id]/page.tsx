"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import { ProductForm, shoeToForm } from "@/components/admin/ProductForm";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
      <Container className="py-10 lg:py-14">
        <p className="text-sm text-red-600">{error}</p>
      </Container>
    );
  }

  if (!product || !options) {
    return (
      <Container className="py-10 lg:py-14">
        <p className="text-sm text-stone-600">Loading product...</p>
      </Container>
    );
  }

  return (
    <Container className="py-10 lg:py-14">
      <SectionHeading
        eyebrow="Admin"
        title="Edit Product"
        description={`Update ${product.name} pricing, collection, thumbnail, and options.`}
      />

      <ProductForm
        collections={collections}
        options={options}
        initialValues={shoeToForm(product)}
        submitLabel="Save Changes"
        onCancel={() => router.push("/admin/products")}
        onSubmit={async (values) => {
          const updated = await apiClient.updateAdminShoe(product.id, values);
          setProduct(updated);
          router.push("/admin/products");
        }}
      />
    </Container>
  );
}
