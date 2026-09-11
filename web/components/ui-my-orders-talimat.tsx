"use client";

import { parseShipInstrFromNote } from "@/components/ui-ship-instr";

/** Siparişlerim row: delivery instruction preference from checkout note. */
export function MyOrderTalimatLine({ note }: { note?: string }) {
  const talimat = parseShipInstrFromNote(note);
  if (!talimat) return null;
  return (
    <div className="faint" data-cta="my-orders-talimat">
      Talimat · {talimat.label}
    </div>
  );
}
