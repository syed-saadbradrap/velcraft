"use client";

import { useEffect, useRef } from "react";

export interface PayFastCheckoutSession {
  checkout_url: string;
  basket_id: string;
  amount: number;
  fields: Record<string, string>;
}

interface PayFastCheckoutFormProps {
  session: PayFastCheckoutSession;
}

export function PayFastCheckoutForm({ session }: PayFastCheckoutFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.submit();
  }, [session]);

  return (
    <div className="mx-auto max-w-xl space-y-6 text-center">
      <div className="glass-panel rounded-[1.75rem] p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-accent">Secure Payment</p>
        <h1 className="mt-3 font-display text-3xl text-stone-900">Redirecting to PayFast</h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">
          Please wait while we open the secure PayFast checkout. You can pay with debit card, credit card,
          or supported wallets. Settlement goes to the merchant Meezan Bank account.
        </p>
        <p className="mt-6 text-sm text-stone-500">Order reference: {session.basket_id}</p>
      </div>

      <form ref={formRef} action={session.checkout_url} method="post" className="hidden">
        {Object.entries(session.fields).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      </form>

      <p className="text-xs text-stone-500">
        If you are not redirected automatically,{" "}
        <button
          type="button"
          className="text-accent underline"
          onClick={() => formRef.current?.submit()}
        >
          click here to continue
        </button>
        .
      </p>
    </div>
  );
}
