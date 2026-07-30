"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { WhatsAppIcon } from "@/components/layout/WhatsAppIcon";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/config/site";
import { getWhatsAppUrl } from "@/lib/utils";

export function WhatsAppButton() {
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

  return createPortal(
    <a
      href={href}
      rel="noopener noreferrer"
      aria-label="Chat with Velcraft on WhatsApp"
      className="whatsapp-float fixed z-[90] inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_32px_rgba(37,211,102,0.4)] transition active:scale-95 hover:bg-[#20bd5a] sm:h-14 sm:w-14"
      style={{
        bottom: "max(1.25rem, env(safe-area-inset-bottom))",
        right: "max(1.25rem, env(safe-area-inset-right))",
      }}
    >
      <WhatsAppIcon className="pointer-events-none h-8 w-8 sm:h-7 sm:w-7" />
    </a>,
    document.body,
  );
}
