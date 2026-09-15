"use client";

import { useState } from "react";
import { parseRecipientFromNote } from "@/components/ui-recipient";

/** Siparişlerim row: alternate recipient preference from checkout note with copy CTA. */
export function MyOrderAliciLine({ note }: { note?: string }) {
  const alici = parseRecipientFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!alici) return null;

  async function copyAlici() {
    try {
      await navigator.clipboard.writeText(alici.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-alici" style={{ marginTop: 6 }}>
      Alıcı · {alici.label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-alici-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyAlici()}
      >
        {copied ? "kopyalandı" : "Alıcıyı kopyala"}
      </button>
    </div>
  );
}
