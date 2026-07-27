"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
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
        <motion.main key={pathname} className="flex-1" {...pageTransition}>
          {children}
        </motion.main>
      </AnimatePresence>
      <SiteFooter />
    </>
  );
}
