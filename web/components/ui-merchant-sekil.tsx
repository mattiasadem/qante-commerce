"use client";

import { parseShipModeFromNote } from "@/components/ui-ship-mode";

/** Merchant Siparişler row: highlight delivery shape from checkout note. */
export function MerchantSekilLine({ note }: { note?: string }) {
  const sekil = parseShipModeFromNote(note);
  if (!sekil) return null;
  return (
    <div className="faint" data-cta="merchant-sekil" style={{ marginTop: 4 }}>
      Teslim şekli · {sekil.label}
    </div>
  );
}
