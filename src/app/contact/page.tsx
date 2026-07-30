import type { Metadata } from "next";
import { apiClient } from "@/lib/api/client";
import { ContactForm } from "@/components/contact/ContactForm";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { contactContent } from "@/lib/content/velcraft";

export const metadata: Metadata = {
  title: "Contact Us",
  description: contactContent.hero.description,
};

export default async function ContactPage() {
  const page = await apiClient.getContactPage();

  const contact = {
    title: contactContent.info.title,
    description: contactContent.info.description,
    email: page.contact.email || contactContent.info.email,
    phone: page.contact.phone || contactContent.info.phone,
    hours: page.contact.hours || contactContent.info.hours,
    address: page.contact.address || contactContent.info.address,
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-border py-24 md:py-28">
        <div className="absolute inset-0 hero-grid-pattern opacity-30" />
        <Container className="relative max-w-4xl">
          <Reveal>
            <h1 className="font-display text-5xl leading-tight text-stone-900 md:text-6xl">{contactContent.hero.title}</h1>
            <p className="mt-6 text-lg leading-8 text-stone-700 md:text-xl md:leading-9">
              {contactContent.hero.description}
            </p>
          </Reveal>
        </Container>
      </section>

      <Container className="py-20 md:py-24">
        <ContactForm content={contact} />
      </Container>
    </>
  );
}
