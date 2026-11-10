import type { Metadata } from "next";
import { PolicyDocumentView } from "@/components/legal/PolicyDocumentView";
import { policyDocuments } from "@/lib/content/policies";

export const metadata: Metadata = {
  title: "Payment Policy",
  description: "Velcraft payment methods including PayFast, COD, and bank transfer.",
};

export default function PaymentPolicyPage() {
  return <PolicyDocumentView document={policyDocuments.payment} activeSlug="payment" />;
}
