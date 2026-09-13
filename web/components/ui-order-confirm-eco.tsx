"use client";

import { parseEcoFromNote } from "@/components/ui-eco";
import { OrderConfirmAmbalajSummary } from "@/components/ui-order-confirm-ambalaj";

/** /siparis confirm: eco pack preference from checkout note; also mounts ambalaj summary. */
export function OrderConfirmEcoSummary({ note }: { note?: string }) {
  const eco = parseEcoFromNote(note);
  return (
    <>
      {eco ? (
        <p className="muted" data-cta="eco-summary" style={{ marginTop: 6 }}>
          Çevre paketi · {eco.label}
        </p>
      ) : null}
      <OrderConfirmAmbalajSummary note={note} />
    </>
  );
}
