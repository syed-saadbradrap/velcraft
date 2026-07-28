import { apiClient } from "@/lib/api/client";
import { homeContent } from "@/lib/content/velcraft";
import { HeroSection } from "@/components/home/HeroSection";
import { WhyChooseUsSection } from "@/components/home/WhyChooseUsSection";
import { FeaturedShoesSection } from "@/components/home/FeaturedShoesSection";
import { AtelierShowcaseSection } from "@/components/home/AtelierShowcaseSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { FaqSection } from "@/components/home/FaqSection";
import { HomeFinalCtaSection } from "@/components/home/HomeFinalCtaSection";

export default async function HomePage() {
  const homepage = await apiClient.getHomepage();

  return (
    <>
      <HeroSection slides={homepage.hero} />
      <WhyChooseUsSection items={homepage.why_choose_us} />
      <FeaturedShoesSection shoes={homepage.featured_shoes} />
      <AtelierShowcaseSection />
      <TestimonialsSection
        testimonials={homepage.testimonials}
        eyebrow={homeContent.testimonials.eyebrow}
        title={homeContent.testimonials.title}
      />
      <FaqSection faqs={homeContent.faqs} title="Frequently Asked Questions" showSidebar={false} />
      <HomeFinalCtaSection />
    </>
  );
}
