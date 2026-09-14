"use client";

import { useState } from "react";
import { parseShipModeFromNote } from "@/components/ui-ship-mode";
import { OrderConfirmNoteSummary } from "@/components/ui-order-confirm-note";

/** /siparis confirm: delivery shape (Kargo / Gel al) from checkout note with copy CTA; also mounts freeform note. */
export function OrderConfirmSekilSummary({ note }: { note?: string }) {
  const sekil = parseShipModeFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copySekil() {
    if (!sekil) return;
    try {
      await navigator.clipboard.writeText(sekil.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {sekil ? (
        <p className="muted" data-cta="sekil-summary" style={{ marginTop: 6 }}>
          Teslim şekli · {sekil.label}
          <button
            className="chip"
            type="button"
            data-cta="sekil-copy"
            style={{ marginLeft: 10 }}
            onClick={() => void copySekil()}
          >
            {copied ? "kopyalandı" : "Şekli kopyala"}
          </button>
        </p>
      ) : null}
      <OrderConfirmNoteSummary note={note} />
    </>
  );
}
