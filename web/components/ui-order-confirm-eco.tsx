"use client";

import { useState } from "react";
import { parseEcoFromNote } from "@/components/ui-eco";
import { OrderConfirmAmbalajSummary } from "@/components/ui-order-confirm-ambalaj";

/** /siparis confirm: eco pack preference from checkout note with copy CTA; also mounts ambalaj summary. */
export function OrderConfirmEcoSummary({ note }: { note?: string }) {
  const eco = parseEcoFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copyEco() {
    if (!eco) return;
    try {
      await navigator.clipboard.writeText(eco.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {eco ? (
        <p className="muted" data-cta="eco-summary" style={{ marginTop: 6 }}>
          Çevre paketi · {eco.label}
          <button
            className="chip"
            type="button"
            data-cta="eco-copy"
            style={{ marginLeft: 10 }}
            onClick={() => void copyEco()}
          >
            {copied ? "kopyalandı" : "Çevreyi kopyala"}
          </button>
        </p>
      ) : null}
      <OrderConfirmAmbalajSummary note={note} />
    </>
  );
}
