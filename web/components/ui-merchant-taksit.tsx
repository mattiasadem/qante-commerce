"use client";

import { useState } from "react";
import { parseTaksitFromNote } from "@/components/ui-taksit";

/** Merchant Siparişler row: installment preference from checkout note with copy CTA. */
export function MerchantTaksitLine({ note }: { note?: string }) {
  const taksit = parseTaksitFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!taksit) return null;

  const label = `Taksit · ${taksit.label}`;

  async function copyTaksit() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-taksit" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-taksit-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyTaksit()}
      >
        {copied ? "kopyalandı" : "Taksiti kopyala"}
      </button>
    </div>
  );
}
