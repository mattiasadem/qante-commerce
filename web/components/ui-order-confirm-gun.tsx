"use client";

import { useState } from "react";
import { parseShipDayFromNote } from "@/components/ui-ship-day";
import { OrderConfirmSaatSummary } from "@/components/ui-order-confirm-saat";

/** /siparis confirm: delivery day preference from checkout note with copy CTA; also mounts saat summary. */
export function OrderConfirmGunSummary({ note }: { note?: string }) {
  const gun = parseShipDayFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copyGun() {
    if (!gun) return;
    try {
      await navigator.clipboard.writeText(gun.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {gun ? (
        <p className="muted" data-cta="gun-summary" style={{ marginTop: 6 }}>
          Teslimat günü · {gun.label}
          <button
            className="chip"
            type="button"
            data-cta="gun-copy"
            style={{ marginLeft: 10 }}
            onClick={() => void copyGun()}
          >
            {copied ? "kopyalandı" : "Günü kopyala"}
          </button>
        </p>
      ) : null}
      <OrderConfirmSaatSummary note={note} />
    </>
  );
}
