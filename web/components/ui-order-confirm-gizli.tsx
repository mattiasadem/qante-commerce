"use client";

import { useState } from "react";
import { parseGizliFromNote } from "@/components/ui-gizli";
import { OrderConfirmErisimSummary } from "@/components/ui-order-confirm-erisim";

/** /siparis confirm: privacy packaging preference from checkout note with copy CTA; also mounts erisim summary. */
export function OrderConfirmGizliSummary({ note }: { note?: string }) {
  const gizli = parseGizliFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copyGizli() {
    if (!gizli) return;
    try {
      await navigator.clipboard.writeText(gizli.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {gizli ? (
        <p className="muted" data-cta="gizli-summary" style={{ marginTop: 6 }}>
          Gizlilik · {gizli.label}
          <button
            className="chip"
            type="button"
            data-cta="gizli-copy"
            style={{ marginLeft: 10 }}
            onClick={() => void copyGizli()}
          >
            {copied ? "kopyalandı" : "Gizliliği kopyala"}
          </button>
        </p>
      ) : null}
      <OrderConfirmErisimSummary note={note} />
    </>
  );
}
