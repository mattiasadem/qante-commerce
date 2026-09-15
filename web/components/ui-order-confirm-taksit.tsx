"use client";

import { useState } from "react";
import { parseTaksitFromNote } from "@/components/ui-taksit";

/** /siparis confirm: installment preference from checkout note with copy CTA. */
export function OrderConfirmTaksitSummary({ note }: { note?: string }) {
  const taksit = parseTaksitFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copyTaksit() {
    if (!taksit) return;
    try {
      await navigator.clipboard.writeText(taksit.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  if (!taksit) return null;
  return (
    <p className="muted" data-cta="taksit-summary" style={{ marginTop: 6 }}>
      Taksit · {taksit.label}
      <button
        className="chip"
        type="button"
        data-cta="taksit-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyTaksit()}
      >
        {copied ? "kopyalandı" : "Taksiti kopyala"}
      </button>
    </p>
  );
}
