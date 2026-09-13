"use client";

import { useState } from "react";
import { parseRecipientFromNote } from "@/components/ui-recipient";
import { OrderConfirmGunSummary } from "@/components/ui-order-confirm-gun";

/** /siparis confirm: alternate recipient from checkout note with copy CTA; also mounts gun summary. */
export function OrderConfirmRecipientSummary({ note }: { note?: string }) {
  const recipient = parseRecipientFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copyRecipient() {
    if (!recipient) return;
    try {
      const text = recipient.phone
        ? `${recipient.name} ${recipient.phone}`
        : recipient.name;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {recipient ? (
        <p className="muted" data-cta="recipient-summary" style={{ marginTop: 6 }}>
          Alıcı · {recipient.label}
          <button
            className="chip"
            type="button"
            data-cta="recipient-copy"
            style={{ marginLeft: 10 }}
            onClick={() => void copyRecipient()}
          >
            {copied ? "kopyalandı" : "Alıcıyı kopyala"}
          </button>
        </p>
      ) : null}
      <OrderConfirmGunSummary note={note} />
    </>
  );
}
