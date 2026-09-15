"use client";

import { useState } from "react";
import { parseInvoiceFromNote } from "@/components/ui-invoice";

/** Siparişlerim row: invoice preference from checkout note with copy CTA. */
export function MyOrderFaturaLine({ note }: { note?: string }) {
  const inv = parseInvoiceFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!inv) return null;

  async function copyFatura() {
    try {
      await navigator.clipboard.writeText(inv.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-fatura" style={{ marginTop: 6 }}>
      Fatura · {inv.label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-fatura-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyFatura()}
      >
        {copied ? "kopyalandı" : "Faturayı kopyala"}
      </button>
    </div>
  );
}
