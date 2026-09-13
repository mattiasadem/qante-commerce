"use client";

import { parseShipSlotFromNote } from "@/components/ui-ship-slot";
import { OrderConfirmHizSummary } from "@/components/ui-order-confirm-hiz";

/** /siparis confirm: delivery time-window preference from checkout note; also mounts hiz summary. */
export function OrderConfirmSaatSummary({ note }: { note?: string }) {
  const saat = parseShipSlotFromNote(note);
  return (
    <>
      {saat ? (
        <p className="muted" data-cta="saat-summary" style={{ marginTop: 6 }}>
          Teslimat saati · {saat.label}
        </p>
      ) : null}
      <OrderConfirmHizSummary note={note} />
    </>
  );
}
