"use client";

import { parsePaketmatikFromNote } from "@/components/ui-paketmatik";
import { OrderConfirmKomsuSummary } from "@/components/ui-order-confirm-komsu";

/** /siparis confirm: paketmatik preference from checkout note; also mounts komsu summary. */
export function OrderConfirmPaketmatikSummary({ note }: { note?: string }) {
  const pk = parsePaketmatikFromNote(note);
  return (
    <>
      {pk ? (
        <p className="muted" data-cta="paketmatik-summary" style={{ marginTop: 6 }}>
          Paketmatik · {pk.label}
        </p>
      ) : null}
      <OrderConfirmKomsuSummary note={note} />
    </>
  );
}
