"use client";

import Link from "next/link";
import { AdminPage, AdminPageHeader, AdminPanel } from "@/components/admin/AdminPage";

const cards = [
  {
    href: "/admin/content/homepage",
    title: "Homepage",
    description: "Hero slides, why-choose cards, testimonials, FAQ and section copy.",
  },
  {
    href: "/admin/content/pages/about",
    title: "About page",
    description: "About hero and story sections synced to the storefront.",
  },
  {
    href: "/admin/content/pages/collection",
    title: "Collection page",
    description: "Collection heading, eyebrow and description.",
  },
  {
    href: "/admin/content/pages/contact",
    title: "Contact page",
    description: "Contact hero copy shown above the form.",
  },
  {
    href: "/admin/content/pages/customize",
    title: "Customize page",
    description: "Studio title and description on the 3D designer page.",
  },
];

export default function AdminContentHubPage() {
  return (
    <AdminPage>
      <AdminPageHeader
        title="Website content"
        description="Edit the text and images shoppers see on the public site. Changes sync through the API."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="block">
            <AdminPanel className="h-full transition-colors hover:border-accent/40">
              <h2 className="font-display text-2xl text-stone-900">{card.title}</h2>
              <p className="mt-2 text-sm text-stone-600">{card.description}</p>
            </AdminPanel>
          </Link>
        ))}
      </div>
    </AdminPage>
  );
}
