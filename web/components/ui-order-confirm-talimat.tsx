"use client";

import { parseShipInstrFromNote } from "@/components/ui-ship-instr";

/** /siparis confirm: delivery instruction preference from checkout note. */
export function OrderConfirmTalimatSummary({ note }: { note?: string }) {
  const talimat = parseShipInstrFromNote(note);
  if (!talimat) return null;
  return (
    <p className="muted" data-cta="talimat-summary" style={{ marginTop: 6 }}>
      Teslimat talimatı · {talimat.label}
    </p>
  );
}
