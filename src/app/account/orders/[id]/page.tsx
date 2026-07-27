"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types/commerce";

export default function AccountOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?next=/account/orders/${params.id}`);
    }
  }, [authLoading, isAuthenticated, params.id, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void apiClient
      .getOrder(Number(params.id))
      .then(setOrder)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [isAuthenticated, params.id]);

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <Container className="py-24">
      <div className="space-y-10">
        <div className="flex flex-wrap items-center gap-4">
          <Button href="/account/orders" variant="secondary" size="sm">
            Back to Orders
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-stone-400">Loading order...</p>
        ) : error ? (
          <p className="text-sm text-red-300">{error}</p>
        ) : order ? (
          <>
            <SectionHeading
              eyebrow="Order"
              title={order.order_number}
              description={`Placed on ${new Date(order.created_at).toLocaleString()}`}
            />

            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="glass-panel space-y-4 rounded-[1.75rem] p-8">
                <h2 className="text-xs uppercase tracking-[0.28em] text-accent">Items</h2>
                {order.items.map((item) => (
                  <article key={item.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h3 className="font-display text-xl text-white">{item.shoe_name}</h3>
                        <p className="mt-1 text-sm text-stone-400">
                          Qty {item.quantity} · {item.customization.shoe_type}
                        </p>
                      </div>
                      <p className="text-accent">{formatPrice(item.total_price)}</p>
                    </div>
                  </article>
                ))}
              </section>

              <aside className="space-y-6">
                <div className="glass-panel rounded-[1.75rem] p-8">
                  <h2 className="text-xs uppercase tracking-[0.28em] text-accent">Status</h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-stone-500">Order</dt>
                      <dd className="capitalize text-white">{order.status}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-stone-500">Payment</dt>
                      <dd className="capitalize text-white">{order.payment_status}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-stone-500">Method</dt>
                      <dd className="capitalize text-white">{order.payment_method.replace("_", " ")}</dd>
                    </div>
                  </dl>
                </div>

                <div className="glass-panel rounded-[1.75rem] p-8">
                  <h2 className="text-xs uppercase tracking-[0.28em] text-accent">Shipping</h2>
                  <p className="mt-4 text-sm leading-7 text-stone-300">
                    {order.shipping_address.full_name}
                    <br />
                    {order.shipping_address.address_line_1}
                    {order.shipping_address.address_line_2 ? (
                      <>
                        <br />
                        {order.shipping_address.address_line_2}
                      </>
                    ) : null}
                    <br />
                    {order.shipping_address.city}, {order.shipping_address.state}{" "}
                    {order.shipping_address.postal_code}
                    <br />
                    {order.shipping_address.country}
                  </p>
                </div>

                <div className="glass-panel rounded-[1.75rem] p-8">
                  <h2 className="text-xs uppercase tracking-[0.28em] text-accent">Totals</h2>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between text-stone-400">
                      <dt>Subtotal</dt>
                      <dd>{formatPrice(order.subtotal)}</dd>
                    </div>
                    {order.discount_amount > 0 ? (
                      <div className="flex justify-between text-accent">
                        <dt>Discount</dt>
                        <dd>-{formatPrice(order.discount_amount)}</dd>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-stone-400">
                      <dt>Shipping</dt>
                      <dd>{formatPrice(order.shipping_amount)}</dd>
                    </div>
                    <div className="flex justify-between border-t border-border pt-4 text-white">
                      <dt>Total</dt>
                      <dd className="font-display text-2xl text-accent">{formatPrice(order.total)}</dd>
                    </div>
                  </dl>
                </div>
              </aside>
            </div>
          </>
        ) : (
          <p className="text-sm text-stone-400">Order not found.</p>
        )}

        <Link href="/account/orders" className="text-sm text-accent hover:underline">
          Return to orders
        </Link>
      </div>
    </Container>
  );
}
