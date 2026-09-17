"use client";

import { useState } from "react";
import { parseShipSlotFromNote } from "@/components/ui-ship-slot";

/** Merchant Siparişler row: delivery time slot from checkout note with copy CTA. */
export function MerchantSaatLine({ note }: { note?: string }) {
  const saat = parseShipSlotFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!saat) return null;

  const label = `Saat · ${saat.label}`;

  async function copySaat() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-saat" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-saat-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copySaat()}
      >
        {copied ? "kopyalandı" : "Saati kopyala"}
      </button>
    </div>
  );
}
