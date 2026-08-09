import type { Metadata } from "next";
import { PolicyDocumentView } from "@/components/legal/PolicyDocumentView";
import { policyDocuments } from "@/lib/content/policies";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Velcraft collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return <PolicyDocumentView document={policyDocuments.privacy} activeSlug="privacy" />;
}
