"use client";

import { useState } from "react";
import { parsePaymentFromNote } from "@/components/ui-payment";

/** Merchant Siparişler row: payment method from checkout note with copy CTA. */
export function MerchantOdemeLine({ note }: { note?: string }) {
  const odeme = parsePaymentFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!odeme) return null;

  const label = `Ödeme · ${odeme.label}`;

  async function copyOdeme() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-odeme" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-odeme-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyOdeme()}
      >
        {copied ? "kopyalandı" : "Ödemeyi kopyala"}
      </button>
    </div>
  );
}
