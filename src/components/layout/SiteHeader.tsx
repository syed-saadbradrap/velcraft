"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { HeaderIconButton } from "@/components/layout/HeaderIconButton";
import { navigation, siteConfig, accountNavigation } from "@/config/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { fadeUp } from "@/lib/motion";

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "relative px-4 py-2 text-[11px] uppercase tracking-[0.24em] transition duration-300",
        active ? "text-accent" : "text-stone-600 hover:text-stone-900",
      )}
    >
      {label}
      {active ? (
        <motion.span
          layoutId="header-nav-active"
          className="absolute inset-0 -z-10 rounded-full border border-accent/20 bg-accent/10"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      ) : null}
    </Link>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, isAdmin, logout } = useAuth();

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-stone-200 bg-stone-100/[0.03] px-4 text-[11px] uppercase tracking-[0.2em] text-stone-600 transition hover:border-accent/30 hover:text-stone-900"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 font-display text-sm text-accent">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <span className="hidden xl:inline">{user.name.split(" ")[0]}</span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-[calc(100%+10px)] z-50 min-w-[220px] overflow-hidden rounded-2xl border border-border bg-white/95 p-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            <p className="px-3 py-2 text-[10px] uppercase tracking-[0.24em] text-stone-600">Account</p>
            {accountNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm text-stone-600 transition hover:bg-stone-100/[0.04] hover:text-stone-900"
              >
                {item.label}
              </Link>
            ))}
            {isAdmin ? (
              <Link
                href="/admin/dashboard"
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2.5 text-sm text-accent transition hover:bg-stone-100/[0.04]"
              >
                Admin Dashboard
              </Link>
            ) : null}
            <div className="my-2 gold-divider opacity-60" />
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void logout();
              }}
              className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-stone-600 transition hover:bg-stone-100/[0.04] hover:text-stone-900"
            >
              Sign Out
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();
  const { itemCount: cartCount, openCart } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div className="header-announcement hidden border-b border-accent/10 bg-[linear-gradient(90deg,rgba(201,169,98,0.08),rgba(201,169,98,0.02),rgba(201,169,98,0.08))] sm:block">
        <div className="section-shell flex h-9 items-center justify-center gap-3 text-[10px] uppercase tracking-[0.28em] text-stone-600">
          <span>Complimentary EU sizing</span>
          <span className="h-1 w-1 rounded-full bg-accent/70" />
          <span>10–14 day atelier delivery</span>
          <span className="h-1 w-1 rounded-full bg-accent/70" />
          <span>Live 3D customization</span>
        </div>
      </div>

      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45 }}
        className={cn(
          "border-b transition duration-500",
          scrolled
            ? "border-border bg-white/92 shadow-[0_16px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            : "border-stone-200/70 bg-white/85 backdrop-blur-lg",
        )}
      >
        <div className="absolute inset-x-0 top-0 gold-divider opacity-50" />

        <div className="section-shell grid h-[76px] grid-cols-[auto_1fr_auto] items-center gap-4 lg:gap-8">
          <BrandLogo priority imageClassName="h-11 sm:h-12" />

          <nav className="hidden justify-center lg:flex">
            <div className="inline-flex items-center gap-1 rounded-full border border-stone-200/70 bg-stone-100/[0.02] p-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  active={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                />
              ))}
            </div>
          </nav>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <HeaderIconButton href={siteConfig.links.wishlist} label="Wishlist" count={wishlistCount}>
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M12 20.5s-7-4.6-7-10a4 4 0 017-2.5 4 4 0 017 2.5c0 5.4-7 10-7 10z" />
                </svg>
              </HeaderIconButton>

              <HeaderIconButton onClick={openCart} label="Cart" count={cartCount}>
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M6 6h15l-1.5 9h-12z" />
                  <path d="M6 6 5 3H2" />
                  <circle cx="9" cy="20" r="1.5" />
                  <circle cx="18" cy="20" r="1.5" />
                </svg>
              </HeaderIconButton>
            </div>

            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <Link
                href={siteConfig.links.login}
                className="hidden rounded-full border border-stone-200 px-4 py-2.5 text-[11px] uppercase tracking-[0.2em] text-stone-600 transition hover:border-accent/30 hover:text-stone-900 sm:inline-flex"
              >
                Sign In
              </Link>
            )}

            <Button href={siteConfig.links.customize} size="sm" className="hidden md:inline-flex">
              Atelier
            </Button>

            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 lg:hidden"
              aria-label="Toggle menu"
              onClick={() => setOpen((value) => !value)}
            >
              <div className="relative h-3 w-5">
                <motion.span animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }} className="absolute left-0 top-0 block h-0.5 w-5 bg-white" />
                <motion.span animate={open ? { opacity: 0 } : { opacity: 1 }} className="absolute left-0 top-[5px] block h-0.5 w-5 bg-white" />
                <motion.span animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }} className="absolute left-0 bottom-0 block h-0.5 w-5 bg-white" />
              </div>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-border lg:hidden"
            >
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
                className="section-shell space-y-1 py-5"
              >
                {navigation.map((item) => (
                  <motion.div key={item.href} variants={fadeUp}>
                    <Link href={item.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-sm uppercase tracking-[0.22em] text-stone-600">
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <div className="my-3 gold-divider opacity-50" />
                <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2">
                  <Link href={siteConfig.links.wishlist} onClick={() => setOpen(false)} className="rounded-xl border border-border px-3 py-3 text-center text-xs uppercase tracking-[0.18em] text-stone-600">
                    Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ""}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      openCart();
                    }}
                    className="rounded-xl border border-border px-3 py-3 text-center text-xs uppercase tracking-[0.18em] text-stone-600"
                  >
                    Cart {cartCount > 0 ? `(${cartCount})` : ""}
                  </button>
                </motion.div>
                {!isAuthenticated ? (
                  <motion.div variants={fadeUp}>
                    <Link href={siteConfig.links.login} onClick={() => setOpen(false)} className="mt-2 block rounded-xl px-3 py-3 text-sm uppercase tracking-[0.2em] text-stone-600">
                      Sign In
                    </Link>
                  </motion.div>
                ) : null}
                <motion.div variants={fadeUp} className="pt-2">
                  <Button href={siteConfig.links.customize} size="sm" className="w-full">
                    Open Atelier
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
      <CartDrawer />
    </header>
  );
}
