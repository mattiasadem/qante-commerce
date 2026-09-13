"use client";

import { parseShipCarrierFromNote } from "@/components/ui-ship-carrier";
import { OrderConfirmSekilSummary } from "@/components/ui-order-confirm-sekil";

/** /siparis confirm: preferred carrier from checkout note; also mounts sekil summary. */
export function OrderConfirmFirmaSummary({ note }: { note?: string }) {
  const firma = parseShipCarrierFromNote(note);
  return (
    <>
      {firma ? (
        <p className="muted" data-cta="firma-summary" style={{ marginTop: 6 }}>
          Kargo firması · {firma.label}
        </p>
      ) : null}
      <OrderConfirmSekilSummary note={note} />
    </>
  );
}
