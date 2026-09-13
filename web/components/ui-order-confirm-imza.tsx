"use client";

import { parseImzaFromNote } from "@/components/ui-imza";
import { OrderConfirmPaketmatikSummary } from "@/components/ui-order-confirm-paketmatik";

/** /siparis confirm: signature preference from checkout note; also mounts paketmatik summary. */
export function OrderConfirmImzaSummary({ note }: { note?: string }) {
  const imza = parseImzaFromNote(note);
  return (
    <>
      {imza ? (
        <p className="muted" data-cta="imza-summary" style={{ marginTop: 6 }}>
          İmza teslimatı · {imza.label}
        </p>
      ) : null}
      <OrderConfirmPaketmatikSummary note={note} />
    </>
  );
}
