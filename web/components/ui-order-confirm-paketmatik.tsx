"use client";

import { useState } from "react";
import { parsePaketmatikFromNote } from "@/components/ui-paketmatik";
import { OrderConfirmKomsuSummary } from "@/components/ui-order-confirm-komsu";

/** /siparis confirm: paketmatik preference from checkout note with copy CTA; also mounts komsu summary. */
export function OrderConfirmPaketmatikSummary({ note }: { note?: string }) {
  const pk = parsePaketmatikFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copyPaketmatik() {
    if (!pk) return;
    try {
      await navigator.clipboard.writeText(pk.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {pk ? (
        <p className="muted" data-cta="paketmatik-summary" style={{ marginTop: 6 }}>
          Paketmatik · {pk.label}
          <button
            className="chip"
            type="button"
            data-cta="paketmatik-copy"
            style={{ marginLeft: 10 }}
            onClick={() => void copyPaketmatik()}
          >
            {copied ? "kopyalandı" : "Paketmatiği kopyala"}
          </button>
        </p>
      ) : null}
      <OrderConfirmKomsuSummary note={note} />
    </>
  );
}
