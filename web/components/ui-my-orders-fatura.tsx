"use client";

import { parseInvoiceFromNote } from "@/components/ui-invoice";

/** Siparişlerim row: invoice preference from checkout note. */
export function MyOrderFaturaLine({ note }: { note?: string }) {
  const inv = parseInvoiceFromNote(note);
  if (!inv) return null;
  return (
    <div className="faint" data-cta="my-orders-fatura">
      Fatura · {inv.label}
    </div>
  );
}
