import type { Metadata } from "next";
import { PolicyDocumentView } from "@/components/legal/PolicyDocumentView";
import { policyDocuments } from "@/lib/content/policies";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "Velcraft refund eligibility, process, and timelines.",
};

export default function RefundPolicyPage() {
  return <PolicyDocumentView document={policyDocuments.refund} activeSlug="refund" />;
}
