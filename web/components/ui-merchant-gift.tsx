"use client";

import { parseGiftFromNote } from "@/components/ui-gift";

/** Merchant Siparişler row: highlight gift wrap from checkout note. */
export function MerchantGiftLine({ note }: { note?: string }) {
  const g = parseGiftFromNote(note);
  if (!g) return null;
  const label = g.note ? `Hediye paketi · ${g.note}` : "Hediye paketi";
  return (
    <div className="faint" data-cta="merchant-gift" style={{ marginTop: 4 }}>
      {label}
    </div>
  );
}
