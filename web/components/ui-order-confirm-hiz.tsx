"use client";

import { useState } from "react";
import { parseShipSpeedFromNote } from "@/components/ui-ship-speed";
import { OrderConfirmTalimatSummary } from "@/components/ui-order-confirm-talimat";

/** /siparis confirm: delivery speed preference from checkout note with copy CTA; also mounts talimat summary. */
export function OrderConfirmHizSummary({ note }: { note?: string }) {
  const hiz = parseShipSpeedFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copyHiz() {
    if (!hiz) return;
    try {
      await navigator.clipboard.writeText(hiz.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {hiz ? (
        <p className="muted" data-cta="hiz-summary" style={{ marginTop: 6 }}>
          Teslimat hızı · {hiz.label}
          <button
            className="chip"
            type="button"
            data-cta="hiz-copy"
            style={{ marginLeft: 10 }}
            onClick={() => void copyHiz()}
          >
            {copied ? "kopyalandı" : "Hızı kopyala"}
          </button>
        </p>
      ) : null}
      <OrderConfirmTalimatSummary note={note} />
    </>
  );
}
