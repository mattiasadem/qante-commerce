"use client";

import { parseShipDayFromNote } from "@/components/ui-ship-day";

/** Merchant Siparişler row: highlight delivery day from checkout note. */
export function MerchantGunLine({ note }: { note?: string }) {
  const gun = parseShipDayFromNote(note);
  if (!gun) return null;
  return (
    <div className="faint" data-cta="merchant-gun" style={{ marginTop: 4 }}>
      Gün · {gun.label}
    </div>
  );
}
