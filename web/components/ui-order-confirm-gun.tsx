"use client";

import { parseShipDayFromNote } from "@/components/ui-ship-day";

/** /siparis confirm: delivery day preference from checkout note. */
export function OrderConfirmGunSummary({ note }: { note?: string }) {
  const gun = parseShipDayFromNote(note);
  if (!gun) return null;
  return (
    <p className="muted" data-cta="gun-summary" style={{ marginTop: 6 }}>
      Teslimat günü · {gun.label}
    </p>
  );
}
