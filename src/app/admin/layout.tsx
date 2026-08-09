"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { AdminNavIconGlyph } from "@/components/admin/AdminIcons";
import { useAuth } from "@/context/AuthContext";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { adminNavigation, getAdminPageMeta } from "@/lib/admin/navigation";
import { cn } from "@/lib/utils";

function AdminLoginContent() {
  const router = useRouter();
  const { isAdmin, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdmin) {
      router.replace("/admin/dashboard");
    }
  }, [isAdmin, isAuthenticated, isLoading, router]);

  if (isLoading || (isAuthenticated && isAdmin)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#faf8f5_0%,#f3efe8_100%)]">
      <div className="mx-auto flex max-w-md flex-col px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center gap-3">
          <BrandLogo imageClassName="h-12 sm:h-14" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">Velcraft</p>
            <p className="text-sm text-stone-600">Admin Console</p>
          </div>
        </div>
        <div className="rounded-[1.75rem] border border-border bg-white p-6 shadow-[0_24px_60px_rgba(28,25,23,0.08)] sm:p-8">
          <LoginForm redirectTo="/admin/dashboard" />
        </div>
      </div>
    </div>
  );
}

function AdminNavLinks({
  pathname,
  onNavigate,
  className,
  compact = false,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
  compact?: boolean;
}) {
  return (
    <nav className={cn("flex flex-col gap-1.5", className)}>
      {adminNavigation.map((item) => {
        const active = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-2xl px-3 py-3 transition",
              active
                ? "bg-accent/15 text-accent"
                : "text-stone-300 hover:bg-white/5 hover:text-white",
            )}
          >
            <span
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition",
                active ? "border-accent/30 bg-accent/10" : "border-white/10 bg-white/5 group-hover:border-white/15",
              )}
            >
              <AdminNavIconGlyph icon={item.icon} />
            </span>
            {!compact ? (
              <span className="min-w-0">
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="block truncate text-[11px] text-stone-400 group-hover:text-stone-300">{item.description}</span>
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isAuthenticated, isLoading, logout, user } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pageMeta = getAdminPageMeta(pathname);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/admin/login") {
      return;
    }

    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.replace("/admin/login");
    }
  }, [isAdmin, isAuthenticated, isLoading, pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100 text-stone-700">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-white px-5 py-4 text-sm shadow-sm">
          <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
          Loading admin console...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f4ef_0%,#faf8f5_100%)] lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="hidden border-r border-stone-800/50 bg-stone-950 lg:block">
        <div className="sticky top-0 flex h-screen flex-col p-5">
          <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
            <BrandLogo imageClassName="h-12 brightness-0 invert" />
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">Admin Console</p>
            <p className="mt-2 truncate text-xs text-stone-400">{user?.email}</p>
          </div>

          <div className="mt-6 flex-1 overflow-y-auto">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-stone-500">Menu</p>
            <AdminNavLinks pathname={pathname} />
          </div>

          <div className="space-y-2 border-t border-white/10 pt-5">
            <Link
              href="/"
              className="block rounded-xl px-3 py-2 text-sm text-stone-300 transition hover:bg-white/5 hover:text-white"
            >
              View Storefront
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-stone-300 transition hover:bg-white/5 hover:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
            <div className="min-w-0 lg:hidden">
              <BrandLogo imageClassName="h-10" />
            </div>
            <div className="hidden min-w-0 lg:block">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
                {pageMeta?.label ?? "Admin"}
              </p>
              <p className="truncate text-sm text-stone-600">{pageMeta?.description ?? "Store management"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/products/new"
                className="hidden rounded-full bg-accent px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[#b8943f] sm:inline-flex"
              >
                Add Product
              </Link>
              <button
                type="button"
                aria-expanded={mobileNavOpen}
                aria-label="Toggle admin menu"
                onClick={() => setMobileNavOpen((open) => !open)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-stone-700 lg:hidden"
              >
                {mobileNavOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>

          {mobileNavOpen ? (
            <div className="border-t border-border bg-stone-950 px-4 py-4 sm:px-6 lg:hidden">
              <AdminNavLinks pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
              <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                <Link href="/" className="block text-sm text-stone-300">
                  View Storefront
                </Link>
                <button type="button" onClick={() => void logout()} className="text-sm text-stone-300">
                  Sign Out
                </button>
              </div>
            </div>
          ) : null}
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return (
      <Suspense fallback={null}>
        <AdminLoginContent />
      </Suspense>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
