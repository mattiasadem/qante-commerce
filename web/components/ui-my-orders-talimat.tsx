"use client";

import { useState } from "react";
import { parseShipInstrFromNote } from "@/components/ui-ship-instr";

/** Siparişlerim row: delivery instruction preference from checkout note with copy CTA. */
export function MyOrderTalimatLine({ note }: { note?: string }) {
  const talimat = parseShipInstrFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!talimat) return null;

  async function copyTalimat() {
    try {
      await navigator.clipboard.writeText(talimat.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-talimat" style={{ marginTop: 6 }}>
      Talimat · {talimat.label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-talimat-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyTalimat()}
      >
        {copied ? "kopyalandı" : "Talimatı kopyala"}
      </button>
    </div>
  );
}
