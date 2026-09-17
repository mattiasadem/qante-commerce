"use client";

import { useState } from "react";
import { parseEcoFromNote } from "@/components/ui-eco";

/** Merchant Siparişler row: eco pack preference from checkout note with copy CTA. */
export function MerchantEcoLine({ note }: { note?: string }) {
  const e = parseEcoFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!e) return null;

  const label = `Eko · ${e.label}`;

  async function copyEco() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-eco" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-eco-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyEco()}
      >
        {copied ? "kopyalandı" : "Eko'yu kopyala"}
      </button>
    </div>
  );
}
