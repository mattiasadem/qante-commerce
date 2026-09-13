"use client";

import { useState } from "react";
import { parsePaymentFromNote } from "@/components/ui-payment";
import { OrderConfirmTaksitSummary } from "@/components/ui-order-confirm-taksit";

/** /siparis confirm: payment method from checkout note with copy CTA; also mounts taksit summary. */
export function OrderConfirmPaymentSummary({ note }: { note?: string }) {
  const payment = parsePaymentFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copyPayment() {
    if (!payment) return;
    try {
      await navigator.clipboard.writeText(payment.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {payment ? (
        <p className="muted" data-cta="payment-summary" style={{ marginTop: 6 }}>
          Ödeme · {payment.label}
          <button
            className="chip"
            type="button"
            data-cta="payment-copy"
            style={{ marginLeft: 10 }}
            onClick={() => void copyPayment()}
          >
            {copied ? "kopyalandı" : "Ödemeyi kopyala"}
          </button>
        </p>
      ) : null}
      <OrderConfirmTaksitSummary note={note} />
    </>
  );
}
