"use client";

import { useState } from "react";
import { parseMontajFromNote } from "@/components/ui-montaj";
import { OrderConfirmDoormanSummary } from "@/components/ui-order-confirm-doorman";

/** /siparis confirm: assembly preference from checkout note with copy CTA; also mounts doorman summary. */
export function OrderConfirmMontajSummary({ note }: { note?: string }) {
  const montaj = parseMontajFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copyMontaj() {
    if (!montaj) return;
    try {
      await navigator.clipboard.writeText(montaj.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {montaj ? (
        <p className="muted" data-cta="montaj-summary" style={{ marginTop: 6 }}>
          Montaj hizmeti · {montaj.label}
          <button
            className="chip"
            type="button"
            data-cta="montaj-copy"
            style={{ marginLeft: 10 }}
            onClick={() => void copyMontaj()}
          >
            {copied ? "kopyalandı" : "Montajı kopyala"}
          </button>
        </p>
      ) : null}
      <OrderConfirmDoormanSummary note={note} />
    </>
  );
}
