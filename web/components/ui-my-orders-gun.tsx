"use client";

import { parseShipDayFromNote } from "@/components/ui-ship-day";

/** Siparişlerim row: delivery day from checkout note. */
export function MyOrderGunLine({ note }: { note?: string }) {
  const gun = parseShipDayFromNote(note);
  if (!gun) return null;
  return (
    <div className="faint" data-cta="my-orders-gun">
      Teslimat günü · {gun.label}
    </div>
  );
}
