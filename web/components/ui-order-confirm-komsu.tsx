"use client";

import { useState } from "react";
import { parseKomsuFromNote } from "@/components/ui-komsu";
import { OrderConfirmGizliSummary } from "@/components/ui-order-confirm-gizli";

/** /siparis confirm: neighbor-delivery preference from checkout note with copy CTA; also mounts gizli summary. */
export function OrderConfirmKomsuSummary({ note }: { note?: string }) {
  const komsu = parseKomsuFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copyKomsu() {
    if (!komsu) return;
    try {
      await navigator.clipboard.writeText(komsu.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {komsu ? (
        <p className="muted" data-cta="komsu-summary" style={{ marginTop: 6 }}>
          Komşu teslimatı · {komsu.label}
          <button
            className="chip"
            type="button"
            data-cta="komsu-copy"
            style={{ marginLeft: 10 }}
            onClick={() => void copyKomsu()}
          >
            {copied ? "kopyalandı" : "Komşuyu kopyala"}
          </button>
        </p>
      ) : null}
      <OrderConfirmGizliSummary note={note} />
    </>
  );
}
