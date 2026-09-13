"use client";

import { parseShipSlotFromNote } from "@/components/ui-ship-slot";

/** /siparis confirm: delivery time-window preference from checkout note. */
export function OrderConfirmSaatSummary({ note }: { note?: string }) {
  const saat = parseShipSlotFromNote(note);
  if (!saat) return null;
  return (
    <p className="muted" data-cta="saat-summary" style={{ marginTop: 6 }}>
      Teslimat saati · {saat.label}
    </p>
  );
}
