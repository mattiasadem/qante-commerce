"use client";

import { parseShipModeFromNote } from "@/components/ui-ship-mode";
import { OrderConfirmNoteSummary } from "@/components/ui-order-confirm-note";

/** /siparis confirm: delivery shape (Kargo / Gel al) from checkout note; also mounts freeform note. */
export function OrderConfirmSekilSummary({ note }: { note?: string }) {
  const sekil = parseShipModeFromNote(note);
  return (
    <>
      {sekil ? (
        <p className="muted" data-cta="sekil-summary" style={{ marginTop: 6 }}>
          Teslim şekli · {sekil.label}
        </p>
      ) : null}
      <OrderConfirmNoteSummary note={note} />
    </>
  );
}
