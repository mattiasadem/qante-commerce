"use client";

import { parseGiftFromNote } from "@/components/ui-gift";

/** /siparis confirm: gift wrap preference from checkout note. */
export function OrderConfirmGiftSummary({ note }: { note?: string }) {
  const gift = parseGiftFromNote(note);
  if (!gift) return null;
  return (
    <p className="muted" data-cta="gift-summary" style={{ marginTop: 6 }}>
      Hediye paketi{gift.note ? ` · ${gift.note}` : ""}
    </p>
  );
}
