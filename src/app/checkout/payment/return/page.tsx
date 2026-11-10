import { Suspense } from "react";
import PayfastReturnPage from "./PayfastReturnClient";

export default function PayfastReturnRoute() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl py-16 text-center text-sm text-stone-600">
          Verifying your PayFast payment...
        </div>
      }
    >
      <PayfastReturnPage />
    </Suspense>
  );
}
