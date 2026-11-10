import type { Metadata } from "next";
import { AboutPageContent } from "@/components/about/AboutPageContent";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "For over 20 years, Velcraft has crafted premium footwear. Discover our story, customization process, and commitment to personalized design.",
};

export default function AboutPage() {
  return <AboutPageContent />;
}
