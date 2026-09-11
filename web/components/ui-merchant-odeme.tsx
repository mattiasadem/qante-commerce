"use client";

import { parsePaymentFromNote } from "@/components/ui-payment";

/** Merchant Siparişler row: highlight payment method from checkout note. */
export function MerchantOdemeLine({ note }: { note?: string }) {
  const odeme = parsePaymentFromNote(note);
  if (!odeme) return null;
  return (
    <div className="faint" data-cta="merchant-odeme" style={{ marginTop: 4 }}>
      Ödeme · {odeme.label}
    </div>
  );
}
