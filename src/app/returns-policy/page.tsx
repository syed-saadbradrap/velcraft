import type { Metadata } from "next";
import { PolicyDocumentView } from "@/components/legal/PolicyDocumentView";
import { policyDocuments } from "@/lib/content/policies";

export const metadata: Metadata = {
  title: "Returns & Exchanges",
  description: "Velcraft return and exchange policy for orders in Pakistan.",
};

export default function ReturnsPolicyPage() {
  return <PolicyDocumentView document={policyDocuments.returns} activeSlug="returns" />;
}
