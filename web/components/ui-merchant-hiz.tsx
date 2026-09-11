"use client";

import { parseShipSpeedFromNote } from "@/components/ui-ship-speed";

/** Merchant Siparişler row: highlight delivery speed from checkout note. */
export function MerchantHizLine({ note }: { note?: string }) {
  const hiz = parseShipSpeedFromNote(note);
  if (!hiz) return null;
  return (
    <div className="faint" data-cta="merchant-hiz" style={{ marginTop: 4 }}>
      Hız · {hiz.label}
    </div>
  );
}
