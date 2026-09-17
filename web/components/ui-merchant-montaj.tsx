"use client";

import { useState } from "react";
import { parseMontajFromNote } from "@/components/ui-montaj";

/** Merchant Siparişler row: assembly preference from checkout note with copy CTA. */
export function MerchantMontajLine({ note }: { note?: string }) {
  const m = parseMontajFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!m) return null;

  const label = `Montaj · ${m.label}`;

  async function copyMontaj() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-montaj" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-montaj-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyMontaj()}
      >
        {copied ? "kopyalandı" : "Montajı kopyala"}
      </button>
    </div>
  );
}
