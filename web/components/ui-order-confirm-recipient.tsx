"use client";

import { parseRecipientFromNote } from "@/components/ui-recipient";

/** /siparis confirm: alternate recipient from checkout note. */
export function OrderConfirmRecipientSummary({ note }: { note?: string }) {
  const recipient = parseRecipientFromNote(note);
  if (!recipient) return null;
  return (
    <p className="muted" data-cta="recipient-summary" style={{ marginTop: 6 }}>
      Alıcı · {recipient.label}
    </p>
  );
}
