"use client";

import { useState } from "react";
import { parsePaymentFromNote } from "@/components/ui-payment";

/** Siparişlerim row: payment method from checkout note with copy CTA. */
export function MyOrderOdemeLine({ note }: { note?: string }) {
  const odeme = parsePaymentFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!odeme) return null;

  async function copyOdeme() {
    try {
      await navigator.clipboard.writeText(odeme.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-odeme" style={{ marginTop: 6 }}>
      Ödeme · {odeme.label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-odeme-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyOdeme()}
      >
        {copied ? "kopyalandı" : "Ödemeyi kopyala"}
      </button>
    </div>
  );
}
