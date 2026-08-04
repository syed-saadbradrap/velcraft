"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/context/AuthContext";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { siteConfig } from "@/config/site";
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
      <div className="flex items-center gap-3 border-b border-border px-6 py-5">
        <BrandLogo imageClassName="h-14" />
        <span className="text-xs uppercase tracking-[0.28em] text-stone-600">Admin</span>
      </div>
      <LoginForm redirectTo="/admin/dashboard" />
    </div>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, isAuthenticated, isLoading, logout, user } = useAuth();

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
    <div className="min-h-screen bg-stone-50 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-border lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col p-6">
          <BrandLogo imageClassName="h-14" />
          <p className="mt-3 text-xs uppercase tracking-[0.22em] text-stone-600">Admin Panel</p>
          <p className="mt-2 text-xs text-stone-600">{user?.email}</p>

          <nav className="mt-8 flex flex-1 flex-col gap-2">
            {adminLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
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

          <div className="mt-8 space-y-2 border-t border-border pt-6">
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

      <div className="min-h-screen">{children}</div>
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
