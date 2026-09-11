"use client";

import { parseShipInstrFromNote } from "@/components/ui-ship-instr";

/** Merchant Siparişler row: highlight delivery instruction from checkout note. */
export function MerchantTalimatLine({ note }: { note?: string }) {
  const talimat = parseShipInstrFromNote(note);
  if (!talimat) return null;
  return (
    <div className="faint" data-cta="merchant-talimat" style={{ marginTop: 4 }}>
      Talimat · {talimat.label}
    </div>
  );
}
