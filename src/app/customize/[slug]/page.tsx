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

export async function generateMetadata({ params }: CustomizePageProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isCustomizableShoe(slug)) {
    return { title: "Customize" };
  }

  const shoe = await apiClient.getShoe(slug);

  return {
    title: shoe ? `Customize ${shoe.name}` : "Customize",
    description: shoe?.description ?? "Design your bespoke shoe in real time.",
  };
}

export default async function CustomizePage({ params }: CustomizePageProps) {
  const { slug } = await params;

  if (!isCustomizableShoe(slug)) {
    redirect(`/collection/shoes/${slug}`);
  }

  const shoe = await apiClient.getShoe(slug);

  if (!shoe) {
    notFound();
  }

  const config = buildCustomizationConfig(shoe);

  return (
    <Container className="py-10 lg:py-16">
      <div className="mb-8 space-y-2">
        <p className="text-xs uppercase tracking-[0.32em] text-accent">Atelier Studio</p>
        <h1 className="font-display text-4xl text-white md:text-5xl">{shoe.name}</h1>
        <p className="max-w-2xl text-sm leading-7 text-stone-400">
          Personalize material, color, buckle, sole, and fit with live preview. This studio is
          exclusive to our signature customizable style.
        </p>
      </div>
      <CustomizeStudio config={config} />
    </Container>
  );
}
