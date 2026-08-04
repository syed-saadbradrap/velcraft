import { Container } from "@/components/ui/Container";

export default function TermsPage() {
  return (
    <Container className="prose prose-invert max-w-3xl py-12 sm:py-16 lg:py-24 prose-headings:font-display">
      <h1>Terms of Service</h1>
      <p>
        By accessing Velcraft, you agree to these terms governing use of our website,
        customization tools, and purchase services.
      </p>
      <h2>Custom Orders</h2>
      <p>
        Customized products are made to your selected specifications. Production timelines and
        final pricing are confirmed during checkout.
      </p>
      <h2>Returns</h2>
      <p>
        Bespoke items may have limited return eligibility. Exceptions are handled case-by-case
        through our concierge team.
      </p>
    </Container>
  );
}
