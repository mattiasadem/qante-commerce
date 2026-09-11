"use client";

import { parseShipCarrierFromNote } from "@/components/ui-ship-carrier";

/** Siparişlerim row: preferred carrier from checkout note. */
export function MyOrderFirmaLine({ note }: { note?: string }) {
  const firma = parseShipCarrierFromNote(note);
  if (!firma) return null;
  return (
    <div className="faint" data-cta="my-orders-firma">
      Firma · {firma.label}
    </div>
  );
}
