"use client";

import { parseTipFromNote } from "@/components/ui-tip";

/** /siparis confirm: courier tip from checkout note. */
export function OrderConfirmTipSummary({ note }: { note?: string }) {
  const tip = parseTipFromNote(note);
  if (!tip) return null;
  return (
    <p className="muted" data-cta="tip-summary" style={{ marginTop: 6 }}>
      Bahşiş · {tip.label}
    </p>
  );
}
