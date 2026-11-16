"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { navigation as fallbackNavigation, siteConfig } from "@/config/site";
import { apiClient } from "@/lib/api/client";
import type { SiteBootstrap } from "@/types/api";

interface SiteCmsValue {
  ready: boolean;
  brandName: string;
  brandTagline: string;
  brandDescription: string;
  logoSrc: string;
  navigation: Array<{ label: string; href: string }>;
  announcementItems: string[];
  footerBlurb: string;
  footerHighlights: Array<{ title: string; body: string }>;
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
    whatsappMessage: string;
    hours: string;
    address: string;
    mapUrl: string;
  };
  deliveryTimeline: string;
  customizePage: {
    eyebrow: string;
    title: string;
    description: string;
  };
}

const defaultValue: SiteCmsValue = {
  ready: false,
  brandName: siteConfig.name,
  brandTagline: siteConfig.tagline,
  brandDescription: siteConfig.description,
  logoSrc: siteConfig.logo.src,
  navigation: fallbackNavigation.map((item) => ({ label: item.label, href: item.href })),
  announcementItems: [
    "Complimentary EU sizing guidance",
    "7–10 business day delivery",
    "Bespoke craftsmanship",
  ],
  footerBlurb: siteConfig.description,
  footerHighlights: [
    { title: "Complimentary sizing guidance", body: "EU men & women sizing with concierge support." },
    { title: "Artisan production", body: `Hand-finished pairs delivered in ${siteConfig.deliveryTimeline}.` },
    { title: "Secure checkout", body: "Cash on delivery and bank transfer available across Pakistan." },
  ],
  contact: {
    email: siteConfig.contact.email,
    phone: siteConfig.contact.phone,
    whatsapp: siteConfig.contact.whatsapp,
    whatsappMessage: siteConfig.contact.whatsappMessage,
    hours: siteConfig.contact.hours,
    address: siteConfig.contact.address,
    mapUrl: siteConfig.contact.mapUrl,
  },
  deliveryTimeline: siteConfig.deliveryTimeline,
  customizePage: {
    eyebrow: "Customization Studio",
    title: "Our Studio",
    description:
      "Customize every detail, from material and color to buckle, sole, and fit, with an interactive live preview. Exclusively designed for our signature customizable shoe style.",
  },
};

const SiteCmsContext = createContext<SiteCmsValue>(defaultValue);

function str(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function mergeSite(data: SiteBootstrap | null): SiteCmsValue {
  if (!data) return { ...defaultValue, ready: true };

  const contact = (data.contact ?? {}) as Record<string, unknown>;
  const commerce = (data.commerce ?? {}) as Record<string, unknown>;
  const footer = (data.footer ?? {}) as Record<string, unknown>;
  const navItems = Array.isArray(data.navigation?.items)
    ? data.navigation.items.filter((item) => item?.label && item?.href)
    : defaultValue.navigation;
  const announcementItems = Array.isArray(data.header?.announcement_items)
    ? data.header.announcement_items.filter((item): item is string => typeof item === "string")
    : defaultValue.announcementItems;
  const highlights = Array.isArray(footer.highlights)
    ? (footer.highlights as Array<{ title?: string; body?: string }>)
        .filter((item) => item.title && item.body)
        .map((item) => ({ title: String(item.title), body: String(item.body) }))
    : defaultValue.footerHighlights;

  return {
    ready: true,
    brandName: str(data.brand?.name, defaultValue.brandName),
    brandTagline: str(data.brand?.tagline, defaultValue.brandTagline),
    brandDescription: str(data.brand?.description, defaultValue.brandDescription),
    logoSrc: str(data.brand?.logo_url, defaultValue.logoSrc),
    navigation: navItems.length > 0 ? navItems : defaultValue.navigation,
    announcementItems:
      announcementItems.length > 0 ? announcementItems : defaultValue.announcementItems,
    footerBlurb: str(footer.blurb, defaultValue.footerBlurb),
    footerHighlights: highlights,
    contact: {
      email: str(contact.email, defaultValue.contact.email),
      phone: str(contact.phone, defaultValue.contact.phone),
      whatsapp: str(contact.whatsapp, defaultValue.contact.whatsapp),
      whatsappMessage: str(contact.whatsapp_message, defaultValue.contact.whatsappMessage),
      hours: str(contact.hours, defaultValue.contact.hours),
      address: str(contact.address, defaultValue.contact.address),
      mapUrl: str(contact.map_url, defaultValue.contact.mapUrl),
    },
    deliveryTimeline: str(commerce.delivery_timeline, defaultValue.deliveryTimeline),
    customizePage: {
      eyebrow: str(data.customize_page?.eyebrow, defaultValue.customizePage.eyebrow),
      title: str(data.customize_page?.title, defaultValue.customizePage.title),
      description: str(data.customize_page?.description, defaultValue.customizePage.description),
    },
  };
}

export function SiteCmsProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<SiteCmsValue>(defaultValue);

  useEffect(() => {
    void apiClient.getSite().then((data) => setValue(mergeSite(data)));
  }, []);

  const memo = useMemo(() => value, [value]);
  return <SiteCmsContext.Provider value={memo}>{children}</SiteCmsContext.Provider>;
}

export function useSiteCms() {
  return useContext(SiteCmsContext);
}
