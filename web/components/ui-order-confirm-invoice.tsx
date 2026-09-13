"use client";

import { useState } from "react";
import { parseInvoiceFromNote } from "@/components/ui-invoice";

/** /siparis confirm: invoice preference from checkout note with copy CTA. */
export function OrderConfirmInvoiceSummary({ note }: { note?: string }) {
  const invoice = parseInvoiceFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!invoice) return null;

  async function copyInvoice() {
    try {
      await navigator.clipboard.writeText(invoice.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <p className="muted" data-cta="invoice-summary" style={{ marginTop: 6 }}>
      Fatura · {invoice.label}
      <button
        className="chip"
        type="button"
        data-cta="invoice-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyInvoice()}
      >
        {copied ? "kopyalandı" : "Faturayı kopyala"}
      </button>
    </p>
  );
}
