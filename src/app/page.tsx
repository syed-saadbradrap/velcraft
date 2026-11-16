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
  const sections = homepage.sections ?? {};

  const trustItems =
    (sections.trust?.body_json?.items as string[] | undefined)?.map((label) => ({
      label,
      detail: "",
    })) ?? undefined;

  const faqsFromCms = sections.faq?.body_json?.faqs as
    | Array<{ question: string; answer: string }>
    | undefined;

  return (
    <>
      <HeroSection slides={homepage.hero} />
      <TrustStrip
        eyebrow={sections.trust?.eyebrow ?? "The Velcraft Standard"}
        items={trustItems}
      />
      <WhyChooseUsSection items={homepage.why_choose_us} />
      <FeaturedShoesSection
        shoes={homepage.featured_shoes}
        eyebrow={sections.products?.eyebrow}
        title={sections.products?.title}
        description={sections.products?.description}
      />
      <div className="defer-section">
        <AtelierShowcaseSection
          eyebrow={sections.atelier?.eyebrow}
          title={sections.atelier?.title}
          description={sections.atelier?.description}
          features={sections.atelier?.body_json?.features as string[] | undefined}
          ctaLabel={sections.atelier?.cta_label}
          ctaUrl={sections.atelier?.cta_url}
        />
      </div>
      <div className="defer-section">
        <TestimonialsSection
          testimonials={homepage.testimonials}
          eyebrow={sections.testimonials?.eyebrow ?? homeContent.testimonials.eyebrow}
          title={sections.testimonials?.title ?? homeContent.testimonials.title}
        />
      </div>
      <div className="defer-section">
        <FaqSection
          faqs={faqsFromCms?.length ? faqsFromCms : homeContent.faqs}
          title={sections.faq?.title ?? "Frequently Asked Questions"}
          eyebrow={sections.faq?.eyebrow ?? undefined}
          showSidebar={false}
        />
      </div>
      <div className="defer-section">
        <HomeFinalCtaSection
          title={sections.final_cta?.title}
          description={sections.final_cta?.description}
          subline={
            typeof sections.final_cta?.body_json?.subline === "string"
              ? sections.final_cta.body_json.subline
              : undefined
          }
          ctaLabel={sections.final_cta?.cta_label}
          ctaUrl={sections.final_cta?.cta_url}
        />
      </div>
    </>
  );
}
