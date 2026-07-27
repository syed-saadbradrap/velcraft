import type { Metadata } from "next";
import { apiClient } from "@/lib/api/client";
import { ContactForm } from "@/components/contact/ContactForm";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach our concierge team for sizing, materials, and order support.",
};

export default async function ContactPage() {
  const page = await apiClient.getContactPage();

  return (
    <Container className="py-24">
      <div className="space-y-12">
        <SectionHeading
          eyebrow="Contact"
          title={page.contact.title}
          description={page.contact.description}
        />
        <ContactForm content={page.contact} />
      </div>
    </Container>
  );
}
