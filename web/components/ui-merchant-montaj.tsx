"use client";

import { parseMontajFromNote } from "@/components/ui-montaj";

/** Merchant Siparişler row: highlight assembly service from checkout note. */
export function MerchantMontajLine({ note }: { note?: string }) {
  const m = parseMontajFromNote(note);
  if (!m) return null;
  return (
    <div className="faint" data-cta="merchant-montaj" style={{ marginTop: 4 }}>
      Montaj · {m.label}
    </div>
  );
}
