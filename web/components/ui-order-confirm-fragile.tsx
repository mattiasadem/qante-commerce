"use client";

import { parseFragileFromNote } from "@/components/ui-fragile";
import { OrderConfirmMontajSummary } from "@/components/ui-order-confirm-montaj";

/** /siparis confirm: fragile pack preference from checkout note; also mounts montaj summary. */
export function OrderConfirmFragileSummary({ note }: { note?: string }) {
  const frag = parseFragileFromNote(note);
  return (
    <>
      {frag ? (
        <p className="muted" data-cta="fragile-summary" style={{ marginTop: 6 }}>
          Kırılgan paket · {frag.label}
        </p>
      ) : null}
      <OrderConfirmMontajSummary note={note} />
    </>
  );
}
