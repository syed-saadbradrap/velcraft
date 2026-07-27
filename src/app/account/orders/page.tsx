"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types/commerce";

export default function AccountOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, logout, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?next=/account/orders");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void apiClient
      .getOrders()
      .then((response) => setOrders(response.items))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <Container className="py-24">
      <div className="space-y-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Account"
            title="Your Orders"
            description={`Signed in as ${user?.email}`}
          />
          <div className="flex flex-wrap gap-3">
            <Button href="/wishlist" variant="secondary" size="sm">
              Wishlist
            </Button>
            <Button href="/cart" variant="secondary" size="sm">
              Cart
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void logout()}>
              Sign Out
            </Button>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-stone-400">Loading orders...</p>
        ) : error ? (
          <p className="text-sm text-red-300">{error}</p>
        ) : orders.length === 0 ? (
          <div className="glass-panel rounded-[1.75rem] p-10 text-center">
            <p className="text-stone-400">No orders yet.</p>
            <Button href="/collection" className="mt-6">
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="glass-panel block rounded-[1.75rem] p-6 transition hover:border-accent/40"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <h2 className="mt-2 font-display text-2xl text-white">{order.order_number}</h2>
                    <p className="mt-1 text-sm capitalize text-stone-400">
                      {order.status} · {order.payment_status}
                    </p>
                  </div>
                  <p className="font-display text-2xl text-accent">{formatPrice(order.total)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
