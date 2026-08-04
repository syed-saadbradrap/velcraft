"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { pageTransition } from "@/lib/motion";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <ScrollProgress />
      <SiteHeader />
      <AnimatePresence mode="wait">
        <motion.main key={pathname} className="min-w-0 flex-1 overflow-x-clip" {...pageTransition}>
          {children}
        </motion.main>
      </AnimatePresence>
      <SiteFooter />
      <WhatsAppButton />
    </>
  );
}
