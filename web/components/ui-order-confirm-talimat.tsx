"use client";

import { parseShipInstrFromNote } from "@/components/ui-ship-instr";
import { OrderConfirmFirmaSummary } from "@/components/ui-order-confirm-firma";

/** /siparis confirm: delivery instruction preference from checkout note; also mounts firma summary. */
export function OrderConfirmTalimatSummary({ note }: { note?: string }) {
  const talimat = parseShipInstrFromNote(note);
  return (
    <>
      {talimat ? (
        <p className="muted" data-cta="talimat-summary" style={{ marginTop: 6 }}>
          Teslimat talimatı · {talimat.label}
        </p>
      ) : null}
      <OrderConfirmFirmaSummary note={note} />
    </>
  );
}
