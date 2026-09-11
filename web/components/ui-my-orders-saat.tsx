"use client";

import { parseShipSlotFromNote } from "@/components/ui-ship-slot";

/** Siparişlerim row: delivery time slot preference from checkout note. */
export function MyOrderSaatLine({ note }: { note?: string }) {
  const saat = parseShipSlotFromNote(note);
  if (!saat) return null;
  return (
    <div className="faint" data-cta="my-orders-saat">
      Teslimat saati · {saat.label}
    </div>
  );
}
