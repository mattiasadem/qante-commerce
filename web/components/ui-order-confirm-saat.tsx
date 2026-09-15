"use client";

import { useState } from "react";
import { parseShipSlotFromNote } from "@/components/ui-ship-slot";
import { OrderConfirmHizSummary } from "@/components/ui-order-confirm-hiz";

/** /siparis confirm: delivery time-window preference from checkout note with copy CTA; also mounts hiz summary. */
export function OrderConfirmSaatSummary({ note }: { note?: string }) {
  const saat = parseShipSlotFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copySaat() {
    if (!saat) return;
    try {
      await navigator.clipboard.writeText(saat.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {saat ? (
        <p className="muted" data-cta="saat-summary" style={{ marginTop: 6 }}>
          Teslimat saati · {saat.label}
          <button
            className="chip"
            type="button"
            data-cta="saat-copy"
            style={{ marginLeft: 10 }}
            onClick={() => void copySaat()}
          >
            {copied ? "kopyalandı" : "Saati kopyala"}
          </button>
        </p>
      ) : null}
      <OrderConfirmHizSummary note={note} />
    </>
  );
}
