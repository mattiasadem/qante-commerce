"use client";

import { parseTaksitFromNote } from "@/components/ui-taksit";

/** Merchant Siparişler row: highlight installment preference from checkout note. */
export function MerchantTaksitLine({ note }: { note?: string }) {
  const taksit = parseTaksitFromNote(note);
  if (!taksit) return null;
  return (
    <div className="faint" data-cta="merchant-taksit" style={{ marginTop: 4 }}>
      Taksit · {taksit.label}
    </div>
  );
}
