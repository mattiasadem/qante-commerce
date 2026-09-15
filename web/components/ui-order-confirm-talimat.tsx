"use client";

import { useState } from "react";
import { parseShipInstrFromNote } from "@/components/ui-ship-instr";
import { OrderConfirmFirmaSummary } from "@/components/ui-order-confirm-firma";

/** /siparis confirm: delivery instruction preference from checkout note with copy CTA; also mounts firma summary. */
export function OrderConfirmTalimatSummary({ note }: { note?: string }) {
  const talimat = parseShipInstrFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copyTalimat() {
    if (!talimat) return;
    try {
      await navigator.clipboard.writeText(talimat.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {talimat ? (
        <p className="muted" data-cta="talimat-summary" style={{ marginTop: 6 }}>
          Teslimat talimatı · {talimat.label}
          <button
            className="chip"
            type="button"
            data-cta="talimat-copy"
            style={{ marginLeft: 10 }}
            onClick={() => void copyTalimat()}
          >
            {copied ? "kopyalandı" : "Talimatı kopyala"}
          </button>
        </p>
      ) : null}
      <OrderConfirmFirmaSummary note={note} />
    </>
  );
}
