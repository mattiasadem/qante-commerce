"use client";

import { parseShipCarrierFromNote } from "@/components/ui-ship-carrier";

/** Merchant Siparişler row: highlight preferred carrier from checkout note. */
export function MerchantFirmaLine({ note }: { note?: string }) {
  const firma = parseShipCarrierFromNote(note);
  if (!firma) return null;
  return (
    <div className="faint" data-cta="merchant-firma" style={{ marginTop: 4 }}>
      Firma · {firma.label}
    </div>
  );
}
