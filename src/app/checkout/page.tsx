"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { getErrorMessage } from "@/lib/api/auth-client";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Textarea } from "@/components/ui/Textarea";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import type {
  CouponValidation,
  Order,
  PaymentMethod,
  ShippingAddress,
  ShippingAddressInput,
} from "@/types/commerce";

const emptyAddress: ShippingAddressInput = {
  full_name: "",
  phone: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "PK",
};

const paymentOptions = [
  { value: "cod" as const, label: siteConfig.payments.cod.label },
  { value: "bank_transfer" as const, label: siteConfig.payments.bankTransfer.label },
];

export default function CheckoutPage() {
  const { isAuthenticated, user } = useAuth();
  const { cart, refreshCart } = useCart();

  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | "new">("new");
  const [newAddress, setNewAddress] = useState<ShippingAddressInput>(emptyAddress);
  const [guestEmail, setGuestEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<CouponValidation | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setAddresses([]);
      setSelectedAddressId("new");
      return;
    }

    void apiClient.getShippingAddresses().then((items) => {
      setAddresses(items);
      const defaultAddress = items.find((item) => item.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (items.length > 0) {
        setSelectedAddressId(items[0].id);
      }
    });
  }, [isAuthenticated]);

  function resolveNewAddress(): ShippingAddressInput {
    return {
      ...newAddress,
      full_name: newAddress.full_name || user?.name || "",
      phone: newAddress.phone || user?.phone || "",
      country: siteConfig.defaultCountry,
    };
  }

  async function handleValidateCoupon() {
    if (!couponCode.trim()) {
      return;
    }

    try {
      const result = await apiClient.validateCoupon(couponCode.trim(), cart?.totals.subtotal);
      setCoupon(result);
      setError("");
    } catch (err) {
      setCoupon(null);
      setError(getErrorMessage(err));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!isAuthenticated && !guestEmail.trim()) {
      setError("Please enter your email to complete guest checkout.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        payment_method: paymentMethod,
        coupon_code: coupon?.code,
        notes: notes || undefined,
        ...(!isAuthenticated
          ? {
              guest_email: guestEmail.trim(),
              shipping_address: resolveNewAddress(),
            }
          : selectedAddressId === "new"
            ? { shipping_address: resolveNewAddress() }
            : { shipping_address_id: selectedAddressId }),
      };

      const order = await apiClient.checkout(payload);
      await refreshCart();

      const confirmed = await apiClient.confirmPayment({
        order_id: order.id,
        payment_method: paymentMethod,
      });
      setCompletedOrder(confirmed);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (completedOrder) {
    const isBankTransfer = completedOrder.payment_method === "bank_transfer";
    const bank = siteConfig.payments.bankTransfer;

    return (
      <Container className="py-12 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-2xl space-y-8 text-center">
          <SectionHeading
            eyebrow="Checkout"
            title="Order Confirmed"
            description={`Thank you. Your order ${completedOrder.order_number} has been placed.`}
            align="center"
          />
          <div className="glass-panel rounded-[1.75rem] p-8 text-left">
            <p className="text-sm text-stone-700">
              Payment method:{" "}
              <span className="capitalize text-stone-900">
                {completedOrder.payment_method.replace("_", " ")}
              </span>
            </p>
            <p className="mt-2 font-display text-3xl text-accent">
              {formatPrice(completedOrder.total)}
            </p>
            {isBankTransfer ? (
              <div className="mt-6 space-y-2 rounded-2xl border border-border bg-stone-50/80 p-5 text-sm text-stone-700">
                <p className="font-medium text-stone-900">Bank transfer details</p>
                <p>Bank: {bank.bankName}</p>
                <p>Account title: {bank.accountTitle}</p>
                <p>Account number: {bank.accountNumber}</p>
                <p>IBAN: {bank.iban}</p>
                <p className="pt-2 text-stone-600">
                  Transfer {formatPrice(completedOrder.total)} and email payment proof to{" "}
                  <a href={`mailto:${siteConfig.contact.email}`} className="text-accent hover:underline">
                    {siteConfig.contact.email}
                  </a>{" "}
                  with order number {completedOrder.order_number}.
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-stone-700">{siteConfig.payments.cod.description}</p>
            )}
            {completedOrder.guest_email ? (
              <p className="mt-4 text-sm text-stone-700">
                Confirmation details will be sent to {completedOrder.guest_email}.
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {isAuthenticated ? (
                <Button href={`/account/orders/${completedOrder.id}`}>View Order</Button>
              ) : (
                <Button href="/login?next=/account/orders">Sign In to Track Orders</Button>
              )}
              <Button href="/collection" variant="secondary">
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  const totals = cart?.totals;
  const discount = coupon?.discount_amount ?? totals?.discount_amount ?? 0;
  const estimatedTotal = (totals?.subtotal ?? 0) - discount + (totals?.shipping_amount ?? 0);

  return (
    <Container className="py-12 sm:py-16 lg:py-24">
      <div className="space-y-10">
        <SectionHeading
          eyebrow="Checkout"
          title="Complete Your Order"
          description={
            isAuthenticated
              ? "Confirm shipping details, apply a coupon, and choose your payment method."
              : "Guest checkout — no account required. Sign in anytime to save your order history."
          }
        />

        {!isAuthenticated ? (
          <p className="text-sm text-stone-700">
            Already have an account?{" "}
            <Link href="/login?next=/checkout" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        ) : null}

        {!cart || cart.items.length === 0 ? (
          <div className="glass-panel rounded-[1.75rem] p-10 text-center">
            <p className="text-stone-700">Your cart is empty.</p>
            <Button href="/cart" className="mt-6">
              Back to Cart
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              {!isAuthenticated ? (
                <section className="glass-panel space-y-5 rounded-[1.75rem] p-8">
                  <h2 className="text-xs uppercase tracking-[0.28em] text-accent">Contact</h2>
                  <Input
                    label="Email"
                    name="guest_email"
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(event) => setGuestEmail(event.target.value)}
                  />
                </section>
              ) : null}

              <section className="glass-panel space-y-5 rounded-[1.75rem] p-8">
                <h2 className="text-xs uppercase tracking-[0.28em] text-accent">Shipping</h2>

                {isAuthenticated && addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className="flex cursor-pointer gap-3 rounded-2xl border border-border p-4"
                      >
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                        />
                        <span className="text-sm text-stone-600">
                          <span className="block font-medium text-stone-900">{address.full_name}</span>
                          {address.address_line_1}, {address.city}, {address.postal_code}
                        </span>
                      </label>
                    ))}
                    <label className="flex cursor-pointer gap-3 rounded-2xl border border-border p-4">
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === "new"}
                        onChange={() => setSelectedAddressId("new")}
                      />
                      <span className="text-sm text-stone-900">Use a new address</span>
                    </label>
                  </div>
                ) : null}

                {!isAuthenticated || selectedAddressId === "new" || addresses.length === 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Full Name"
                      name="full_name"
                      required
                      value={newAddress.full_name || user?.name || ""}
                      onChange={(event) =>
                        setNewAddress((current) => ({ ...current, full_name: event.target.value }))
                      }
                    />
                    <Input
                      label="Phone"
                      name="phone"
                      type="tel"
                      placeholder="+92 300 1234567"
                      value={newAddress.phone || user?.phone || ""}
                      onChange={(event) =>
                        setNewAddress((current) => ({ ...current, phone: event.target.value }))
                      }
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="Address Line 1"
                        name="address_line_1"
                        required
                        value={newAddress.address_line_1}
                        onChange={(event) =>
                          setNewAddress((current) => ({
                            ...current,
                            address_line_1: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        label="Address Line 2"
                        name="address_line_2"
                        value={newAddress.address_line_2 ?? ""}
                        onChange={(event) =>
                          setNewAddress((current) => ({
                            ...current,
                            address_line_2: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <Input
                      label="City"
                      name="city"
                      required
                      value={newAddress.city}
                      onChange={(event) =>
                        setNewAddress((current) => ({ ...current, city: event.target.value }))
                      }
                    />
                    <Input
                      label="Province"
                      name="state"
                      value={newAddress.state ?? ""}
                      onChange={(event) =>
                        setNewAddress((current) => ({ ...current, state: event.target.value }))
                      }
                    />
                    <Input
                      label="Postal Code"
                      name="postal_code"
                      required
                      value={newAddress.postal_code}
                      onChange={(event) =>
                        setNewAddress((current) => ({
                          ...current,
                          postal_code: event.target.value,
                        }))
                      }
                    />
                    <div className="sm:col-span-2">
                      <input type="hidden" name="country" value={siteConfig.defaultCountry} />
                      <label className="block space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-700">
                          Country
                        </span>
                        <div className="flex h-14 items-center rounded-2xl border border-border bg-stone-50 px-5 text-base text-stone-900">
                          {siteConfig.countryName}
                        </div>
                      </label>
                    </div>
                  </div>
                ) : null}
              </section>

              <section className="glass-panel space-y-5 rounded-[1.75rem] p-8">
                <h2 className="text-xs uppercase tracking-[0.28em] text-accent">Coupon</h2>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    label="Coupon Code"
                    name="coupon_code"
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                  />
                  <Button type="button" variant="secondary" className="sm:mt-7" onClick={() => void handleValidateCoupon()}>
                    Apply
                  </Button>
                </div>
                {coupon ? (
                  <p className="text-sm text-accent">
                    {coupon.code} applied — save {formatPrice(coupon.discount_amount)}
                  </p>
                ) : null}
              </section>

              <section className="glass-panel space-y-5 rounded-[1.75rem] p-8">
                <h2 className="text-xs uppercase tracking-[0.28em] text-accent">Payment</h2>
                <div className="grid gap-3">
                  {paymentOptions.map(({ value, label }) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border px-4 py-3"
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={value}
                        checked={paymentMethod === value}
                        onChange={() => setPaymentMethod(value)}
                      />
                      <span className="text-sm text-stone-900">{label}</span>
                    </label>
                  ))}
                </div>
                {paymentMethod === "cod" ? (
                  <p className="text-sm text-stone-600">{siteConfig.payments.cod.description}</p>
                ) : (
                  <div className="space-y-2 rounded-2xl border border-border bg-stone-50/80 p-5 text-sm text-stone-700">
                    <p className="font-medium text-stone-900">Bank account details</p>
                    <p>Bank: {siteConfig.payments.bankTransfer.bankName}</p>
                    <p>Account title: {siteConfig.payments.bankTransfer.accountTitle}</p>
                    <p>Account number: {siteConfig.payments.bankTransfer.accountNumber}</p>
                    <p>IBAN: {siteConfig.payments.bankTransfer.iban}</p>
                    <p className="pt-2 text-stone-600">{siteConfig.payments.bankTransfer.description}</p>
                  </div>
                )}
                <Textarea
                  label="Order Notes"
                  name="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </section>
            </div>

            <aside className="glass-panel h-fit self-start rounded-[1.75rem] p-8 lg:sticky lg:top-28">
              <p className="text-xs uppercase tracking-[0.28em] text-stone-600">Summary</p>
              <ul className="mt-6 space-y-4 border-b border-border pb-6">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4 text-sm">
                    <span className="text-stone-700">
                      {item.shoe.name} × {item.quantity}
                    </span>
                    <span className="text-stone-900">{formatPrice(item.line_total)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between text-stone-700">
                  <dt>Subtotal</dt>
                  <dd>{formatPrice(totals?.subtotal ?? 0)}</dd>
                </div>
                {discount > 0 ? (
                  <div className="flex justify-between text-accent">
                    <dt>Discount</dt>
                    <dd>-{formatPrice(discount)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between text-stone-700">
                  <dt>Shipping</dt>
                  <dd>{formatPrice(totals?.shipping_amount ?? 0)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-4 text-stone-900">
                  <dt>Total</dt>
                  <dd className="font-display text-2xl text-accent">{formatPrice(estimatedTotal)}</dd>
                </div>
              </dl>
              <Button type="submit" size="lg" className="mt-8 w-full" disabled={loading}>
                {loading ? "Placing order..." : isAuthenticated ? "Place Order" : "Place Guest Order"}
              </Button>
              {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
            </aside>
          </form>
        )}
      </div>
    </Container>
  );
}
