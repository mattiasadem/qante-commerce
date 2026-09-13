"use client";

import { useState } from "react";
import { parseTipFromNote } from "@/components/ui-tip";

/** /siparis confirm: courier tip from checkout note with copy CTA. */
export function OrderConfirmTipSummary({ note }: { note?: string }) {
  const tip = parseTipFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!tip) return null;

  async function copyTip() {
    try {
      await navigator.clipboard.writeText(tip.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <p className="muted" data-cta="tip-summary" style={{ marginTop: 6 }}>
      Bahşiş · {tip.label}
      <button
        className="chip"
        type="button"
        data-cta="tip-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyTip()}
      >
        {copied ? "kopyalandı" : "Bahşişi kopyala"}
      </button>
    </p>
  );
}
