"use client";

import { parseGizliFromNote } from "@/components/ui-gizli";

/** Merchant Siparişler row: highlight privacy pack preference from checkout note. */
export function MerchantGizliLine({ note }: { note?: string }) {
  const g = parseGizliFromNote(note);
  if (!g) return null;
  return (
    <div className="faint" data-cta="merchant-gizli" style={{ marginTop: 4 }}>
      Gizlilik · {g.label}
    </div>
  );
}
