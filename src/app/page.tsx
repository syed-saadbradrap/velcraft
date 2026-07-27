import { apiClient } from "@/lib/api/client";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustStrip } from "@/components/home/TrustStrip";
import { CraftsmanshipSection } from "@/components/home/CraftsmanshipSection";
import { FeaturedShoesSection } from "@/components/home/FeaturedShoesSection";
import { CollectionsPreviewSection } from "@/components/home/CollectionsPreviewSection";
import { CustomizationProcessSection } from "@/components/home/CustomizationProcessSection";
import { WhyChooseUsSection } from "@/components/home/WhyChooseUsSection";
import { AtelierShowcaseSection } from "@/components/home/AtelierShowcaseSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FaqSection } from "@/components/home/FaqSection";
import { NewsletterSectionBlock } from "@/components/home/NewsletterSection";

export default async function HomePage() {
  const [homepage, collections] = await Promise.all([
    apiClient.getHomepage(),
    apiClient.getCollections(),
  ]);

  return (
    <>
      <HeroSection slides={homepage.hero} />
      <TrustStrip />
      <FeaturedShoesSection shoes={homepage.featured_shoes} />
      <CraftsmanshipSection />
      <CustomizationProcessSection steps={homepage.process_steps} />
      <CollectionsPreviewSection collections={collections} />
      <WhyChooseUsSection items={homepage.why_choose_us} />
      <AtelierShowcaseSection />
      <TestimonialsSection testimonials={homepage.testimonials} />
      <FaqSection />
      <NewsletterSectionBlock content={homepage.newsletter} />
    </>
  );
}
