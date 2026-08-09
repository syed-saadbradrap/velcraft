"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/auth-client";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/types/commerce";

export default function PayfastReturnClient() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderNumber = searchParams.get("order");
    const status = searchParams.get("status");
    const signature = searchParams.get("signature") ?? searchParams.get("SIGNATURE") ?? undefined;
    const transactionId =
      searchParams.get("transaction_id") ?? searchParams.get("TRANSACTION_ID") ?? undefined;

    if (!orderNumber || !status) {
      setError("Missing payment return details.");
      setLoading(false);
      return;
    }

    void apiClient
      .verifyPayfastReturn({
        order_number: orderNumber,
        signature,
        status: status === "success" ? "success" : "failure",
        transaction_id: transactionId,
      })
      .then((confirmed) => {
        setOrder(confirmed);
        setError("");
      })
      .catch((err) => {
        setError(getErrorMessage(err, "Unable to verify payment."));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams]);

  if (loading) {
    return (
      <Container className="py-16">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm text-stone-600">Verifying your PayFast payment...</p>
        </div>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container className="py-16">
        <div className="mx-auto max-w-xl space-y-6 text-center">
          <SectionHeading
            eyebrow="Payment"
            title="Payment Not Completed"
            description={error || "We could not confirm your card payment."}
            align="center"
          />
          <div className="flex flex-wrap justify-center gap-3">
            <Button href="/checkout">Try Again</Button>
            <Button href="/contact" variant="secondary">
              Contact Support
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-2xl space-y-8 text-center">
        <SectionHeading
          eyebrow="Payment"
          title="Payment Successful"
          description={`Thank you. Order ${order.order_number} has been paid securely via PayFast.`}
          align="center"
        />
        <div className="glass-panel rounded-[1.75rem] p-8 text-left">
          <p className="text-sm text-stone-700">
            Payment method: <span className="text-stone-900">Debit / Credit Card</span>
          </p>
          <p className="mt-2 font-display text-3xl text-accent">{formatPrice(order.total)}</p>
          <p className="mt-4 text-sm text-stone-600">
            Your payment will settle to the merchant Meezan Bank account according to PayFast processing
            timelines.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href={`/account/orders/${order.id}`}>View Order</Button>
            <Button href="/collection" variant="secondary">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
