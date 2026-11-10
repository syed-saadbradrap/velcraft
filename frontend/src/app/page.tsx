import dynamic from "next/dynamic";
import { apiClient } from "@/lib/api/client";
import { homeContent } from "@/lib/content/velcraft";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustStrip } from "@/components/home/TrustStrip";
import { WhyChooseUsSection } from "@/components/home/WhyChooseUsSection";
import { FeaturedShoesSection } from "@/components/home/FeaturedShoesSection";

const AtelierShowcaseSection = dynamic(
  () => import("@/components/home/AtelierShowcaseSection").then((mod) => mod.AtelierShowcaseSection),
);
const TestimonialsSection = dynamic(
  () => import("@/components/home/TestimonialsSection").then((mod) => mod.TestimonialsSection),
);
const FaqSection = dynamic(() => import("@/components/home/FaqSection").then((mod) => mod.FaqSection));
const HomeFinalCtaSection = dynamic(
  () => import("@/components/home/HomeFinalCtaSection").then((mod) => mod.HomeFinalCtaSection),
);

export const revalidate = 120;

export default async function HomePage() {
  const homepage = await apiClient.getHomepage();

  return (
    <>
      <HeroSection slides={homepage.hero} />
      <TrustStrip />
      <WhyChooseUsSection items={homepage.why_choose_us} />
      <FeaturedShoesSection shoes={homepage.featured_shoes} />
      <div className="defer-section">
        <AtelierShowcaseSection />
      </div>
      <div className="defer-section">
        <TestimonialsSection
          testimonials={homepage.testimonials}
          eyebrow={homeContent.testimonials.eyebrow}
          title={homeContent.testimonials.title}
        />
      </div>
      <div className="defer-section">
        <FaqSection faqs={homeContent.faqs} title="Frequently Asked Questions" showSidebar={false} />
      </div>
      <div className="defer-section">
        <HomeFinalCtaSection />
      </div>
    </>
  );
}
