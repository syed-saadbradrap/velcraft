"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Reveal } from "@/components/motion/Reveal";
import { navigation, siteConfig } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/layout/WhatsAppIcon";
import { getWhatsAppUrl } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/motion";

const highlights = [
  { title: "Complimentary sizing guidance", body: "EU men & women sizing with concierge support." },
  { title: "Artisan production", body: `Hand-finished pairs delivered in ${siteConfig.deliveryTimeline}.` },
  { title: "Secure checkout", body: "Cash on delivery and bank transfer available across Pakistan." },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-stone-50">
      <div className="border-b border-border bg-white py-8">
        <Container>
          <motion.div
            variants={staggerContainer(0.08, 0.05)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid gap-6 md:grid-cols-3"
          >
            {highlights.map((item) => (
              <motion.div
                key={item.title}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                className="glass-panel glass-panel-hover rounded-[1.25rem] p-5"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-accent">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-stone-700">{item.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </div>

      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <Reveal className="space-y-4">
          <BrandLogo linked={false} imageClassName="h-[6rem]" />
          <p className="max-w-xs text-sm leading-7 text-stone-700">{siteConfig.description}</p>
          <Button href={siteConfig.links.customize} size="sm">
            Start Customizing
          </Button>
        </Reveal>

        <Reveal delay={0.05}>
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-accent">Explore</p>
          <ul className="space-y-3">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group inline-flex text-sm text-stone-700 transition hover:text-stone-900"
                >
                  <span className="transition-transform group-hover:translate-x-1">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-accent">Client Care</p>
          <ul className="space-y-3">
            <li>
              <Link href={siteConfig.links.privacy} className="text-sm text-stone-700 hover:text-stone-900">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href={siteConfig.links.terms} className="text-sm text-stone-700 hover:text-stone-900">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href={siteConfig.links.contact} className="text-sm text-stone-700 hover:text-stone-900">
                Contact Concierge
              </Link>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-accent">Contact</p>
          <p className="text-sm leading-7 text-stone-700">
            Mon–Sat, 12:00 PM – 10:00 PM
            <br />
            <a href={`mailto:${siteConfig.contact.email}`} className="transition hover:text-accent">
              {siteConfig.contact.email}
            </a>
            <br />
            <a href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`} className="transition hover:text-accent">
              {siteConfig.contact.phone}
            </a>
            <br />
            <a
              href={siteConfig.contact.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-accent"
            >
              {siteConfig.contact.address}
            </a>
            <br />
            <a
              href={getWhatsAppUrl(siteConfig.contact.whatsapp, siteConfig.contact.whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 transition hover:text-[#25D366]"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </a>
          </p>
        </Reveal>
      </Container>

      <div className="border-t border-border">
        <Container className="flex flex-col gap-3 py-6 text-sm text-stone-600 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p>Bespoke footwear, crafted with intention.</p>
        </Container>
      </div>
    </footer>
  );
}
