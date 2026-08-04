import { Container } from "@/components/ui/Container";

export default function PrivacyPage() {
  return (
    <Container className="prose prose-invert max-w-3xl py-12 sm:py-16 lg:py-24 prose-headings:font-display">
      <h1>Privacy Policy</h1>
      <p>
        Velcraft respects your privacy. This policy describes how personal data is collected,
        processed, and protected when you browse, customize products, or place orders.
      </p>
      <h2>Information We Collect</h2>
      <p>
        We collect account details, order information, customization preferences, and communication
        records necessary to deliver our services.
      </p>
      <h2>How We Use Information</h2>
      <p>
        Data is used to fulfill orders, improve product experiences, provide support, and comply
        with legal obligations.
      </p>
    </Container>
  );
}
