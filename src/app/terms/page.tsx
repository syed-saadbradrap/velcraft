import type { Metadata } from "next";
import { PolicyDocumentView } from "@/components/legal/PolicyDocumentView";
import { policyDocuments } from "@/lib/content/policies";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using Velcraft website and placing orders.",
};

export default function TermsPage() {
  return <PolicyDocumentView document={policyDocuments.terms} activeSlug="terms" />;
}
