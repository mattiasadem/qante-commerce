"use client";

import { parseAmbalajFromNote } from "@/components/ui-ambalaj";
import { OrderConfirmFragileSummary } from "@/components/ui-order-confirm-fragile";

/** /siparis confirm: packaging preference from checkout note; also mounts fragile summary. */
export function OrderConfirmAmbalajSummary({ note }: { note?: string }) {
  const pack = parseAmbalajFromNote(note);
  return (
    <>
      {pack ? (
        <p className="muted" data-cta="ambalaj-summary" style={{ marginTop: 6 }}>
          Ambalaj · {pack.label}
        </p>
      ) : null}
      <OrderConfirmFragileSummary note={note} />
    </>
  );
}
