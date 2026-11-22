"use client";

import Link from "next/link";
import { AdminPage, AdminPageHeader, AdminPanel } from "@/components/admin/AdminPage";
import { PAGE_META, type EditablePageKey } from "@/lib/admin/page-meta";

const HUB: Array<{
  key: EditablePageKey | "homepage-studio";
  href: string;
  title: string;
  description: string;
  badge: string;
}> = [
  {
    key: "homepage-studio",
    href: "/admin/content/homepage",
    title: "Homepage studio",
    description:
      "Hero slides, why-choose cards, testimonials, and homepage section copy — the main storefront.",
    badge: "Most used",
  },
  {
    key: "collection",
    href: "/admin/content/pages/collection",
    title: PAGE_META.collection.title,
    description: PAGE_META.collection.description,
    badge: "Browse",
  },
  {
    key: "customize",
    href: "/admin/content/pages/customize",
    title: PAGE_META.customize.title,
    description: PAGE_META.customize.description,
    badge: "3D studio",
  },
  {
    key: "about",
    href: "/admin/content/pages/about",
    title: PAGE_META.about.title,
    description: PAGE_META.about.description,
    badge: "Brand",
  },
  {
    key: "contact",
    href: "/admin/content/pages/contact",
    title: PAGE_META.contact.title,
    description: PAGE_META.contact.description,
    badge: "Support",
  },
];

export default function AdminContentHubPage() {
  return (
    <AdminPage>
      <AdminPageHeader
        title="Website content"
        description="Edit the words and images shoppers see. Changes sync to the live site after you save."
        action={
          <Link
            href="/admin/settings"
            className="inline-flex h-11 items-center rounded-full border border-border px-5 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700 transition hover:border-accent/40 hover:text-accent"
          >
            Site settings →
          </Link>
        }
      />

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {HUB.map((card) => (
          <Link key={card.href} href={card.href} className="group block">
            <AdminPanel className="flex h-full flex-col justify-between transition duration-200 group-hover:-translate-y-0.5 group-hover:border-accent/35">
              <div>
                <span className="inline-flex rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                  {card.badge}
                </span>
                <h2 className="mt-4 font-display text-2xl text-stone-900">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">{card.description}</p>
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 transition group-hover:text-accent">
                Open editor →
              </p>
            </AdminPanel>
          </Link>
        ))}
      </div>
    </AdminPage>
  );
}
