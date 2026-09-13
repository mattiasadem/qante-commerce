"use client";

import { parseMontajFromNote } from "@/components/ui-montaj";
import { OrderConfirmDoormanSummary } from "@/components/ui-order-confirm-doorman";

/** /siparis confirm: assembly preference from checkout note; also mounts doorman summary. */
export function OrderConfirmMontajSummary({ note }: { note?: string }) {
  const montaj = parseMontajFromNote(note);
  return (
    <>
      {montaj ? (
        <p className="muted" data-cta="montaj-summary" style={{ marginTop: 6 }}>
          Montaj hizmeti · {montaj.label}
        </p>
      ) : null}
      <OrderConfirmDoormanSummary note={note} />
    </>
  );
}
