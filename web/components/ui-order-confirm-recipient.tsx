"use client";

import { parseRecipientFromNote } from "@/components/ui-recipient";
import { OrderConfirmGunSummary } from "@/components/ui-order-confirm-gun";

/** /siparis confirm: alternate recipient from checkout note; also mounts gun summary. */
export function OrderConfirmRecipientSummary({ note }: { note?: string }) {
  const recipient = parseRecipientFromNote(note);
  return (
    <>
      {recipient ? (
        <p className="muted" data-cta="recipient-summary" style={{ marginTop: 6 }}>
          Alıcı · {recipient.label}
        </p>
      ) : null}
      <OrderConfirmGunSummary note={note} />
    </>
  );
}
