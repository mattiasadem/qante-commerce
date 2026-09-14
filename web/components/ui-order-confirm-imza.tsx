"use client";

import { useState } from "react";
import { parseImzaFromNote } from "@/components/ui-imza";
import { OrderConfirmPaketmatikSummary } from "@/components/ui-order-confirm-paketmatik";

/** /siparis confirm: signature preference from checkout note with copy CTA; also mounts paketmatik summary. */
export function OrderConfirmImzaSummary({ note }: { note?: string }) {
  const imza = parseImzaFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copyImza() {
    if (!imza) return;
    try {
      await navigator.clipboard.writeText(imza.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {imza ? (
        <p className="muted" data-cta="imza-summary" style={{ marginTop: 6 }}>
          İmza teslimatı · {imza.label}
          <button
            className="chip"
            type="button"
            data-cta="imza-copy"
            style={{ marginLeft: 10 }}
            onClick={() => void copyImza()}
          >
            {copied ? "kopyalandı" : "İmzayı kopyala"}
          </button>
        </p>
      ) : null}
      <OrderConfirmPaketmatikSummary note={note} />
    </>
  );
}
