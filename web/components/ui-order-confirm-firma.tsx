"use client";

import { useState } from "react";
import { parseShipCarrierFromNote } from "@/components/ui-ship-carrier";
import { OrderConfirmSekilSummary } from "@/components/ui-order-confirm-sekil";

/** /siparis confirm: preferred carrier from checkout note with copy CTA; also mounts sekil summary. */
export function OrderConfirmFirmaSummary({ note }: { note?: string }) {
  const firma = parseShipCarrierFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copyFirma() {
    if (!firma) return;
    try {
      await navigator.clipboard.writeText(firma.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {firma ? (
        <p className="muted" data-cta="firma-summary" style={{ marginTop: 6 }}>
          Kargo firması · {firma.label}
          <button
            className="chip"
            type="button"
            data-cta="firma-copy"
            style={{ marginLeft: 10 }}
            onClick={() => void copyFirma()}
          >
            {copied ? "kopyalandı" : "Firmayı kopyala"}
          </button>
        </p>
      ) : null}
      <OrderConfirmSekilSummary note={note} />
    </>
  );
}
