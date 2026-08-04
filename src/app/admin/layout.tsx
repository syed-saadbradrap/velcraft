"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/context/AuthContext";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { cn } from "@/lib/utils";

const adminLinks = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Customers", href: "/admin/customers" },
  { label: "Messages", href: "/admin/contact-messages" },
  { label: "Coupons", href: "/admin/coupons" },
] as const;

function AdminLoginContent() {
  const router = useRouter();
  const { isAdmin, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdmin) {
      router.replace("/admin/dashboard");
    }
  }, [isAdmin, isAuthenticated, isLoading, router]);

  if (isLoading) {
    return null;
  }

  if (isAuthenticated && isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-6 sm:py-5">
        <BrandLogo imageClassName="h-12 sm:h-14" />
        <span className="text-xs uppercase tracking-[0.28em] text-stone-600">Admin</span>
      </div>
      <LoginForm redirectTo="/admin/dashboard" />
    </div>
  );
}

function AdminNavLinks({
  pathname,
  onNavigate,
  className,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={cn("flex flex-col gap-2", className)}>
      {adminLinks.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "rounded-2xl px-4 py-3 text-sm uppercase tracking-[0.18em] transition",
            pathname.startsWith(item.href)
              ? "bg-accent/10 text-accent"
              : "text-stone-700 hover:bg-stone-100/5 hover:text-stone-900",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isAuthenticated, isLoading, logout, user } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
      <div className="flex min-h-screen items-center justify-center bg-stone-50 text-stone-700">
        Loading admin...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="hidden border-r border-border lg:block">
        <div className="sticky top-0 flex h-screen flex-col p-6">
          <BrandLogo imageClassName="h-14" />
          <p className="mt-3 text-xs uppercase tracking-[0.22em] text-stone-600">Admin Panel</p>
          <p className="mt-2 break-all text-xs text-stone-600">{user?.email}</p>

          <div className="mt-8 flex-1">
            <AdminNavLinks pathname={pathname} />
          </div>

          <div className="space-y-2 border-t border-border pt-6">
            <Link href="/" className="block text-sm text-stone-700 hover:text-stone-900">
              View Storefront
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="text-sm text-stone-700 hover:text-stone-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-stone-50/95 backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <BrandLogo imageClassName="h-11" />
              <p className="mt-1 truncate text-[10px] uppercase tracking-[0.2em] text-stone-500">
                {user?.email}
              </p>
            </div>
            <button
              type="button"
              aria-expanded={mobileNavOpen}
              aria-label="Toggle admin menu"
              onClick={() => setMobileNavOpen((open) => !open)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-stone-700"
            >
              {mobileNavOpen ? "✕" : "☰"}
            </button>
          </div>

          {mobileNavOpen ? (
            <div className="border-t border-border px-4 py-4 sm:px-6">
              <AdminNavLinks pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <Link href="/" className="block text-sm text-stone-700 hover:text-stone-900">
                  View Storefront
                </Link>
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="text-sm text-stone-700 hover:text-stone-900"
                >
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
