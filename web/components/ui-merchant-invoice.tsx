"use client";

import { parseInvoiceFromNote } from "@/components/ui-invoice";

/** Merchant Siparişler row: highlight invoice type from checkout note. */
export function MerchantInvoiceLine({ note }: { note?: string }) {
  const inv = parseInvoiceFromNote(note);
  if (!inv) return null;
  return (
    <div className="faint" data-cta="merchant-invoice" style={{ marginTop: 4 }}>
      Fatura · {inv.label}
    </div>
  );
}
