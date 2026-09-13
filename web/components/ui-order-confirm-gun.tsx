"use client";

import { parseShipDayFromNote } from "@/components/ui-ship-day";
import { OrderConfirmSaatSummary } from "@/components/ui-order-confirm-saat";

/** /siparis confirm: delivery day preference from checkout note; also mounts saat summary. */
export function OrderConfirmGunSummary({ note }: { note?: string }) {
  const gun = parseShipDayFromNote(note);
  return (
    <>
      {gun ? (
        <p className="muted" data-cta="gun-summary" style={{ marginTop: 6 }}>
          Teslimat günü · {gun.label}
        </p>
      ) : null}
      <OrderConfirmSaatSummary note={note} />
    </>
  );
}
