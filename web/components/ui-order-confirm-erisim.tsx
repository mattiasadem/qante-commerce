"use client";

import { useState } from "react";
import { parseErisimFromNote } from "@/components/ui-erisim";
import { OrderConfirmDestekSummary } from "@/components/ui-order-confirm-destek";

/** /siparis confirm: building-access preference from checkout note with copy CTA; also mounts destek summary. */
export function OrderConfirmErisimSummary({ note }: { note?: string }) {
  const erisim = parseErisimFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copyErisim() {
    if (!erisim) return;
    try {
      await navigator.clipboard.writeText(erisim.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {erisim ? (
        <p className="muted" data-cta="erisim-summary" style={{ marginTop: 6 }}>
          Erişim · {erisim.label}
          <button
            className="chip"
            type="button"
            data-cta="erisim-copy"
            style={{ marginLeft: 10 }}
            onClick={() => void copyErisim()}
          >
            {copied ? "kopyalandı" : "Erişimi kopyala"}
          </button>
        </p>
      ) : null}
      <OrderConfirmDestekSummary note={note} />
    </>
  );
}
