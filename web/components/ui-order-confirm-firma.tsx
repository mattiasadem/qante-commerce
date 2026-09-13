"use client";

import { parseShipCarrierFromNote } from "@/components/ui-ship-carrier";

/** /siparis confirm: preferred carrier from checkout note. */
export function OrderConfirmFirmaSummary({ note }: { note?: string }) {
  const firma = parseShipCarrierFromNote(note);
  if (!firma) return null;
  return (
    <p className="muted" data-cta="firma-summary" style={{ marginTop: 6 }}>
      Kargo firması · {firma.label}
    </p>
  );
}
