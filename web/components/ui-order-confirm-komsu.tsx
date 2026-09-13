"use client";

import { parseKomsuFromNote } from "@/components/ui-komsu";
import { OrderConfirmGizliSummary } from "@/components/ui-order-confirm-gizli";

/** /siparis confirm: neighbor-delivery preference from checkout note; also mounts gizli summary. */
export function OrderConfirmKomsuSummary({ note }: { note?: string }) {
  const komsu = parseKomsuFromNote(note);
  return (
    <>
      {komsu ? (
        <p className="muted" data-cta="komsu-summary" style={{ marginTop: 6 }}>
          Komşu teslimatı · {komsu.label}
        </p>
      ) : null}
      <OrderConfirmGizliSummary note={note} />
    </>
  );
}
