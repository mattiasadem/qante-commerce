"use client";

import { parseShipSpeedFromNote } from "@/components/ui-ship-speed";
import { OrderConfirmTalimatSummary } from "@/components/ui-order-confirm-talimat";

/** /siparis confirm: delivery speed preference from checkout note; also mounts talimat summary. */
export function OrderConfirmHizSummary({ note }: { note?: string }) {
  const hiz = parseShipSpeedFromNote(note);
  return (
    <>
      {hiz ? (
        <p className="muted" data-cta="hiz-summary" style={{ marginTop: 6 }}>
          Teslimat hızı · {hiz.label}
        </p>
      ) : null}
      <OrderConfirmTalimatSummary note={note} />
    </>
  );
}
