"use client";

import { parsePaymentFromNote } from "@/components/ui-payment";

/** /siparis confirm: payment method from checkout note. */
export function OrderConfirmPaymentSummary({ note }: { note?: string }) {
  const payment = parsePaymentFromNote(note);
  if (!payment) return null;
  return (
    <p className="muted" data-cta="payment-summary" style={{ marginTop: 6 }}>
      Ödeme · {payment.label}
    </p>
  );
}
