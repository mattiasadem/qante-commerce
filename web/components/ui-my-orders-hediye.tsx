"use client";

import { parseGiftFromNote } from "@/components/ui-gift";

/** Siparişlerim row: gift wrap preference from checkout note. */
export function MyOrderHediyeLine({ note }: { note?: string }) {
  const gift = parseGiftFromNote(note);
  if (!gift) return null;
  return (
    <div className="faint" data-cta="my-orders-gift">
      {gift.note ? `Hediye paketi · ${gift.note}` : "Hediye paketi"}
    </div>
  );
}
