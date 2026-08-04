"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { WhatsAppIcon } from "@/components/layout/WhatsAppIcon";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/config/site";
import { getWhatsAppUrl } from "@/lib/utils";

function hasMobilePurchaseBar(pathname: string) {
  return pathname.startsWith("/collection/shoes/") || pathname.startsWith("/customize/");
}

export function WhatsAppButton() {
  const pathname = usePathname();
  const { isOpen: cartOpen } = useCart();
  const [mounted, setMounted] = useState(false);

  const href = getWhatsAppUrl(
    siteConfig.contact.whatsapp,
    siteConfig.contact.whatsappMessage,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || cartOpen) {
    return null;
  }

  const raised = hasMobilePurchaseBar(pathname);

  return createPortal(
    <a
      href={href}
      rel="noopener noreferrer"
      aria-label="Chat with Velcraft on WhatsApp"
      className="whatsapp-float fixed z-[90] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_32px_rgba(37,211,102,0.4)] transition active:scale-95 hover:bg-[#20bd5a] sm:h-14 sm:w-14"
      style={{
        bottom: raised
          ? "max(5.75rem, calc(4.5rem + env(safe-area-inset-bottom)))"
          : "max(1.25rem, env(safe-area-inset-bottom))",
        right: "max(1.25rem, env(safe-area-inset-right))",
      }}
    >
      <WhatsAppIcon className="pointer-events-none h-7 w-7" />
    </a>,
    document.body,
  );
}
