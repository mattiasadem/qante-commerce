"use client";

import { parseShipSpeedFromNote } from "@/components/ui-ship-speed";

/** /siparis confirm: delivery speed preference from checkout note. */
export function OrderConfirmHizSummary({ note }: { note?: string }) {
  const hiz = parseShipSpeedFromNote(note);
  if (!hiz) return null;
  return (
    <p className="muted" data-cta="hiz-summary" style={{ marginTop: 6 }}>
      Teslimat hızı · {hiz.label}
    </p>
  );
}
