"use client";

import { parseInvoiceFromNote } from "@/components/ui-invoice";

/** /siparis confirm: invoice preference from checkout note. */
export function OrderConfirmInvoiceSummary({ note }: { note?: string }) {
  const invoice = parseInvoiceFromNote(note);
  if (!invoice) return null;
  return (
    <p className="muted" data-cta="invoice-summary" style={{ marginTop: 6 }}>
      Fatura · {invoice.label}
    </p>
  );
}
