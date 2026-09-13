"use client";

import { parseDestekFromNote } from "@/components/ui-destek";
import { OrderConfirmRecipientSummary } from "@/components/ui-order-confirm-recipient";

/** /siparis confirm: prioritized support preference from checkout note; also mounts recipient summary. */
export function OrderConfirmDestekSummary({ note }: { note?: string }) {
  const destek = parseDestekFromNote(note);
  return (
    <>
      {destek ? (
        <p className="muted" data-cta="destek-summary" style={{ marginTop: 6 }}>
          Destek · {destek.label}
        </p>
      ) : null}
      <OrderConfirmRecipientSummary note={note} />
    </>
  );
}
