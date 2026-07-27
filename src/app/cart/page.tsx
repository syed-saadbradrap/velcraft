"use client";



import Link from "next/link";

import { useCart } from "@/context/CartContext";

import { Button } from "@/components/ui/Button";

import { Container } from "@/components/ui/Container";

import { SectionHeading } from "@/components/ui/SectionHeading";

import { formatPrice } from "@/lib/utils";

import { customizeUrl, isCustomizableShoe } from "@/lib/catalog/purchase";



export default function CartPage() {

  const { cart, isLoading, updateItemQuantity, removeItem } = useCart();



  const items = cart?.items ?? [];

  const totals = cart?.totals;



  return (

    <Container className="py-24">

      <div className="space-y-10">

        <SectionHeading

          eyebrow="Cart"

          title="Your Selection"

          description="Review your pieces before checkout. No account required."

        />



        {isLoading && !cart ? (

          <p className="text-sm text-stone-400">Loading cart...</p>

        ) : items.length === 0 ? (

          <div className="glass-panel rounded-[1.75rem] p-10 text-center">

            <p className="text-stone-400">Your cart is empty.</p>

            <Button href="/collection" className="mt-6">

              Browse Collection

            </Button>

          </div>

        ) : (

          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">

            <div className="space-y-4">

              {items.map((item) => (

                <article key={item.id} className="glass-panel rounded-[1.75rem] p-6">

                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start">

                    <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-stone-900">

                      {item.shoe.thumbnail_url ? (

                        // eslint-disable-next-line @next/next/no-img-element

                        <img

                          src={item.shoe.thumbnail_url}

                          alt={item.shoe.name}

                          className="h-full w-full object-cover"

                        />

                      ) : null}

                    </div>

                    <div className="flex-1 space-y-3">

                      <div className="flex flex-wrap items-start justify-between gap-3">

                        <div>

                          <h2 className="font-display text-2xl text-white">{item.shoe.name}</h2>

                          <p className="mt-1 text-sm capitalize text-stone-400">

                            {item.customization.shoe_type} · Size selected

                          </p>

                        </div>

                        <p className="font-display text-xl text-accent">{formatPrice(item.line_total)}</p>

                      </div>



                      <div className="flex flex-wrap items-center gap-3">

                        <label className="text-xs uppercase tracking-[0.22em] text-stone-500">

                          Qty

                          <select

                            value={item.quantity}

                            onChange={(event) =>

                              void updateItemQuantity(item.id, Number(event.target.value))

                            }

                            className="ml-3 rounded-full border border-border bg-stone-950 px-3 py-2 text-sm text-white outline-none"

                          >

                            {[1, 2, 3, 4, 5].map((value) => (

                              <option key={value} value={value}>

                                {value}

                              </option>

                            ))}

                          </select>

                        </label>

                        <button

                          type="button"

                          onClick={() => void removeItem(item.id)}

                          className="text-sm text-stone-400 transition hover:text-red-300"

                        >

                          Remove

                        </button>

                        <Link

                          href={

                            isCustomizableShoe(item.shoe.slug)

                              ? customizeUrl()

                              : `/collection/shoes/${item.shoe.slug}`

                          }

                          className="text-sm text-accent hover:underline"

                        >

                          {isCustomizableShoe(item.shoe.slug) ? "Edit design" : "View product"}

                        </Link>

                      </div>

                    </div>

                  </div>

                </article>

              ))}

            </div>



            <aside className="glass-panel h-fit rounded-[1.75rem] p-8">

              <p className="text-xs uppercase tracking-[0.28em] text-stone-500">Order Summary</p>

              <dl className="mt-6 space-y-4 text-sm">

                <div className="flex justify-between text-stone-400">

                  <dt>Subtotal</dt>

                  <dd>{formatPrice(totals?.subtotal ?? 0)}</dd>

                </div>

                <div className="flex justify-between text-stone-400">

                  <dt>Shipping</dt>

                  <dd>{formatPrice(totals?.shipping_amount ?? 0)}</dd>

                </div>

                <div className="flex justify-between border-t border-border pt-4 text-white">

                  <dt className="font-medium">Total</dt>

                  <dd className="font-display text-2xl text-accent">{formatPrice(totals?.total ?? 0)}</dd>

                </div>

              </dl>

              <Button href="/checkout" size="lg" className="mt-8 w-full">

                Proceed to Checkout

              </Button>

              <p className="mt-4 text-center text-xs text-stone-500">

                Guest checkout available.{" "}

                <Link href="/login?next=/checkout" className="text-accent hover:underline">

                  Sign in

                </Link>{" "}

                to save your order history.

              </p>

            </aside>

          </div>

        )}

      </div>

    </Container>

  );

}


