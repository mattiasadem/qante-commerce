"use client";

import { useState } from "react";
import { parseAmbalajFromNote } from "@/components/ui-ambalaj";
import { OrderConfirmFragileSummary } from "@/components/ui-order-confirm-fragile";

/** /siparis confirm: packaging preference from checkout note with copy CTA; also mounts fragile summary. */
export function OrderConfirmAmbalajSummary({ note }: { note?: string }) {
  const pack = parseAmbalajFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copyAmbalaj() {
    if (!pack) return;
    try {
      await navigator.clipboard.writeText(pack.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {pack ? (
        <p className="muted" data-cta="ambalaj-summary" style={{ marginTop: 6 }}>
          Ambalaj · {pack.label}
          <button
            className="chip"
            type="button"
            data-cta="ambalaj-copy"
            style={{ marginLeft: 10 }}
            onClick={() => void copyAmbalaj()}
          >
            {copied ? "kopyalandı" : "Ambalajı kopyala"}
          </button>
        </p>
      ) : null}
      <OrderConfirmFragileSummary note={note} />
    </>
  );
}
