"use client";

import { useState } from "react";
import { parseTipFromNote } from "@/components/ui-tip";

/** Merchant Siparişler row: courier tip from checkout note with copy CTA. */
export function MerchantTipLine({ note }: { note?: string }) {
  const t = parseTipFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!t) return null;

  const label = `Bahşiş · ${t.label}`;

  async function copyTip() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-tip" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-tip-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyTip()}
      >
        {copied ? "kopyalandı" : "Bahşişi kopyala"}
      </button>
    </div>
  );
}
