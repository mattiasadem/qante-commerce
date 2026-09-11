"use client";

import { parseShipSlotFromNote } from "@/components/ui-ship-slot";

/** Merchant Siparişler row: highlight delivery time slot from checkout note. */
export function MerchantSaatLine({ note }: { note?: string }) {
  const saat = parseShipSlotFromNote(note);
  if (!saat) return null;
  return (
    <div className="faint" data-cta="merchant-saat" style={{ marginTop: 4 }}>
      Saat · {saat.label}
    </div>
  );
}
