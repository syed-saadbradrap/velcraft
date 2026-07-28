import { apiClient } from "@/lib/api/client";
import { homeContent } from "@/lib/content/velcraft";
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
import { HomeFinalCtaSection } from "@/components/home/HomeFinalCtaSection";

export default async function HomePage() {
  const [homepage, collections] = await Promise.all([
    apiClient.getHomepage(),
    apiClient.getCollections(),
  ]);

  return (
    <>
      <HeroSection slides={homepage.hero} />
      <TrustStrip />
      <WhyChooseUsSection items={homepage.why_choose_us} />
      <AtelierShowcaseSection />
      <FeaturedShoesSection shoes={homepage.featured_shoes} />
      <CraftsmanshipSection />
      <CustomizationProcessSection steps={homepage.process_steps} />
      <CollectionsPreviewSection collections={collections} />
      <TestimonialsSection
        testimonials={homepage.testimonials}
        eyebrow={homeContent.testimonials.eyebrow}
        title={homeContent.testimonials.title}
        description={homeContent.testimonials.description}
      />
      <FaqSection
        faqs={homeContent.faqs}
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        description="Quick answers about customization, colors, buckles, sizing, materials, and ordering."
      />
      <HomeFinalCtaSection />
    </>
  );
}
