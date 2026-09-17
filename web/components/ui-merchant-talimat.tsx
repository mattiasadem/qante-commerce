"use client";

import { useState } from "react";
import { parseShipInstrFromNote } from "@/components/ui-ship-instr";

/** Merchant Siparişler row: delivery instruction from checkout note with copy CTA. */
export function MerchantTalimatLine({ note }: { note?: string }) {
  const talimat = parseShipInstrFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!talimat) return null;

  const label = `Talimat · ${talimat.label}`;

  async function copyTalimat() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-talimat" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-talimat-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyTalimat()}
      >
        {copied ? "kopyalandı" : "Talimatı kopyala"}
      </button>
    </div>
  );
}
