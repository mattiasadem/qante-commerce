"use client";

import { useState } from "react";
import { parseFragileFromNote } from "@/components/ui-fragile";
import { OrderConfirmMontajSummary } from "@/components/ui-order-confirm-montaj";

/** /siparis confirm: fragile pack preference from checkout note with copy CTA; also mounts montaj summary. */
export function OrderConfirmFragileSummary({ note }: { note?: string }) {
  const frag = parseFragileFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copyFragile() {
    if (!frag) return;
    try {
      await navigator.clipboard.writeText(frag.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {frag ? (
        <p className="muted" data-cta="fragile-summary" style={{ marginTop: 6 }}>
          Kırılgan paket · {frag.label}
          <button
            className="chip"
            type="button"
            data-cta="fragile-copy"
            style={{ marginLeft: 10 }}
            onClick={() => void copyFragile()}
          >
            {copied ? "kopyalandı" : "Kırılganı kopyala"}
          </button>
        </p>
      ) : null}
      <OrderConfirmMontajSummary note={note} />
    </>
  );
}
