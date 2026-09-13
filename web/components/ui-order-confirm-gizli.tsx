"use client";

import { parseGizliFromNote } from "@/components/ui-gizli";
import { OrderConfirmErisimSummary } from "@/components/ui-order-confirm-erisim";

/** /siparis confirm: privacy packaging preference from checkout note; also mounts erisim summary. */
export function OrderConfirmGizliSummary({ note }: { note?: string }) {
  const gizli = parseGizliFromNote(note);
  return (
    <>
      {gizli ? (
        <p className="muted" data-cta="gizli-summary" style={{ marginTop: 6 }}>
          Gizlilik · {gizli.label}
        </p>
      ) : null}
      <OrderConfirmErisimSummary note={note} />
    </>
  );
}
