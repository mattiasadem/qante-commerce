"use client";

import { parsePaymentFromNote } from "@/components/ui-payment";
import { OrderConfirmTaksitSummary } from "@/components/ui-order-confirm-taksit";

/** /siparis confirm: payment method from checkout note; also mounts taksit summary. */
export function OrderConfirmPaymentSummary({ note }: { note?: string }) {
  const payment = parsePaymentFromNote(note);
  return (
    <>
      {payment ? (
        <p className="muted" data-cta="payment-summary" style={{ marginTop: 6 }}>
          Ödeme · {payment.label}
        </p>
      ) : null}
      <OrderConfirmTaksitSummary note={note} />
    </>
  );
}
