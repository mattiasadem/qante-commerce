"use client";

import { parsePaymentFromNote } from "@/components/ui-payment";

/** Siparişlerim row: payment method from checkout note. */
export function MyOrderOdemeLine({ note }: { note?: string }) {
  const odeme = parsePaymentFromNote(note);
  if (!odeme) return null;
  return (
    <div className="faint" data-cta="my-orders-odeme">
      Ödeme · {odeme.label}
    </div>
  );
}
