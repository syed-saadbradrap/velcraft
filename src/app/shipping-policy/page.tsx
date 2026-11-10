import type { Metadata } from "next";
import { PolicyDocumentView } from "@/components/legal/PolicyDocumentView";
import { policyDocuments } from "@/lib/content/policies";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description: "Velcraft shipping fees, delivery areas, and timelines across Pakistan.",
};

export default function ShippingPolicyPage() {
  return <PolicyDocumentView document={policyDocuments.shipping} activeSlug="shipping" />;
}
