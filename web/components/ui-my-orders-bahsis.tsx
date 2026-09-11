"use client";

import { parseTipFromNote } from "@/components/ui-tip";

/** Siparişlerim row: courier tip preference from checkout note. */
export function MyOrderBahsisLine({ note }: { note?: string }) {
  const tip = parseTipFromNote(note);
  if (!tip) return null;
  return (
    <div className="faint" data-cta="my-orders-bahsis">
      Bahşiş · {tip.label}
    </div>
  );
}
