"use client";

import { parseEcoFromNote } from "@/components/ui-eco";

/** Merchant Siparişler row: highlight eco pack preference from checkout note. */
export function MerchantEcoLine({ note }: { note?: string }) {
  const e = parseEcoFromNote(note);
  if (!e) return null;
  return (
    <div className="faint" data-cta="merchant-eco" style={{ marginTop: 4 }}>
      Eko · {e.label}
    </div>
  );
}
