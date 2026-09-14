"use client";

import { useState } from "react";
import { parseDestekFromNote } from "@/components/ui-destek";
import { OrderConfirmRecipientSummary } from "@/components/ui-order-confirm-recipient";

/** /siparis confirm: prioritized support preference from checkout note with copy CTA; also mounts recipient summary. */
export function OrderConfirmDestekSummary({ note }: { note?: string }) {
  const destek = parseDestekFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copyDestek() {
    if (!destek) return;
    try {
      await navigator.clipboard.writeText(destek.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {destek ? (
        <p className="muted" data-cta="destek-summary" style={{ marginTop: 6 }}>
          Destek · {destek.label}
          <button
            className="chip"
            type="button"
            data-cta="destek-copy"
            style={{ marginLeft: 10 }}
            onClick={() => void copyDestek()}
          >
            {copied ? "kopyalandı" : "Desteği kopyala"}
          </button>
        </p>
      ) : null}
      <OrderConfirmRecipientSummary note={note} />
    </>
  );
}
