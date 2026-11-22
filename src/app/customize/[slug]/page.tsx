import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { isCustomizableShoe } from "@/lib/catalog/purchase";
import { buildCustomizationConfig } from "@/lib/customize/config-builder";
import { CustomizeStudio } from "@/components/customize/CustomizeStudio";
import { Container } from "@/components/ui/Container";

interface CustomizePageProps {
  params: Promise<{ slug: string }>;
}

const FALLBACK_DESCRIPTION =
  "Customize every detail, from material and color to buckle, sole, and fit, with an interactive live preview. Exclusively designed for our signature customizable shoe style.";

export async function generateMetadata({ params }: CustomizePageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isCustomizableShoe(slug)) {
    return { title: "Customize" };
  }

  const [shoe, site] = await Promise.all([apiClient.getShoe(slug), apiClient.getSite()]);
  const config = shoe ? buildCustomizationConfig(shoe) : null;
  const title = site?.customize_page?.title || config?.shoeName || "Customize";

  return {
    title: `Customize ${title}`,
    description: site?.customize_page?.description ?? shoe?.description ?? FALLBACK_DESCRIPTION,
  };
}

export default async function CustomizePage({ params }: CustomizePageProps) {
  const { slug } = await params;

  if (!isCustomizableShoe(slug)) {
    redirect(`/collection/shoes/${slug}`);
  }

  const [shoe, site, page] = await Promise.all([
    apiClient.getShoe(slug),
    apiClient.getSite(),
    apiClient.getPageSections("customize"),
  ]);

  if (!shoe) {
    notFound();
  }

  const config = buildCustomizationConfig(shoe);
  const eyebrow =
    page.hero?.eyebrow || site?.customize_page?.eyebrow || "Customization Studio";
  const title = page.hero?.title || site?.customize_page?.title || config.shoeName;
  const description =
    page.hero?.description || site?.customize_page?.description || FALLBACK_DESCRIPTION;

  return (
    <Container className="py-3 lg:py-10">
      <div className="mb-4 hidden space-y-1 lg:mb-6 lg:block">
        <p className="text-xs uppercase tracking-[0.32em] text-accent">{eyebrow}</p>
        <h1 className="break-words font-display text-[clamp(1.875rem,6vw,3rem)] leading-[1.08] text-stone-900">
          {title}
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-stone-700">{description}</p>
      </div>
      <CustomizeStudio config={config} />
    </Container>
  );
}
