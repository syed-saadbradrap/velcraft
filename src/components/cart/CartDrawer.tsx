"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { shoeImageUrl } from "@/lib/media";

export function CartDrawer() {
  const { cart, isLoading, isOpen, closeCart, updateItemQuantity, removeItem, itemCount } = useCart();

  const items = cart?.items ?? [];
  const totals = cart?.totals;

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeCart();
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Close cart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 z-[70] bg-stone-100/40 backdrop-blur-[2px]"
          />

          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed inset-y-0 right-0 z-[80] flex w-full max-w-md flex-col border-l border-stone-200 bg-white shadow-[-24px_0_60px_rgba(28,25,23,0.12)]"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-accent">Your Cart</p>
                <h2 className="font-display text-2xl text-stone-900">
                  {itemCount} {itemCount === 1 ? "Item" : "Items"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close cart panel"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-600 transition hover:border-accent/30 hover:text-stone-900"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 custom-scrollbar">
              {isLoading && !cart ? (
                <p className="text-sm text-stone-600">Loading cart...</p>
              ) : items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                  <p className="font-display text-2xl text-stone-900">Your cart is empty</p>
                  <p className="mt-2 text-sm text-stone-600">Add a pair from our collection to get started.</p>
                  <Button href="/collection" className="mt-6" onClick={closeCart}>
                    Browse Collection
                  </Button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.id} className="rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
                      <div className="flex gap-4">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={shoeImageUrl(item.shoe)}
                            alt={item.shoe.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-600">
                                {item.shoe.collection?.name ?? "Collection"}
                              </p>
                              <h3 className="font-display text-lg leading-tight text-stone-900">{item.shoe.name}</h3>
                            </div>
                            <p className="shrink-0 font-display text-base text-accent">{formatPrice(item.line_total)}</p>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase tracking-[0.18em] text-stone-600">Qty</span>
                              <QuantityStepper
                                value={item.quantity}
                                onChange={(quantity) => void updateItemQuantity(item.id, quantity)}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => void removeItem(item.id)}
                              className="text-xs text-stone-600 transition hover:text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 ? (
              <div className="border-t border-stone-200 bg-white px-6 py-5">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between text-stone-600">
                    <dt>Subtotal</dt>
                    <dd>{formatPrice(totals?.subtotal ?? 0)}</dd>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <dt>Shipping</dt>
                    <dd>{formatPrice(totals?.shipping_amount ?? 0)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-stone-200 pt-3 text-stone-900">
                    <dt className="font-semibold">Total</dt>
                    <dd className="font-display text-xl text-accent">{formatPrice(totals?.total ?? 0)}</dd>
                  </div>
                </dl>

                <Button href={siteConfig.links.checkout} size="lg" className="mt-5 w-full" onClick={closeCart}>
                  Proceed to Checkout
                </Button>
                <Link
                  href={siteConfig.links.cart}
                  onClick={closeCart}
                  className="mt-4 block text-center text-xs uppercase tracking-[0.2em] text-stone-600 transition hover:text-accent"
                >
                  View Full Cart
                </Link>
              </div>
            ) : null}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
