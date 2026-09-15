"use client";

import { useState } from "react";
import { parseShipSlotFromNote } from "@/components/ui-ship-slot";

/** Siparişlerim row: delivery time slot preference from checkout note with copy CTA. */
export function MyOrderSaatLine({ note }: { note?: string }) {
  const saat = parseShipSlotFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!saat) return null;

  async function copySaat() {
    try {
      await navigator.clipboard.writeText(saat.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-saat" style={{ marginTop: 6 }}>
      Teslimat saati · {saat.label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-saat-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copySaat()}
      >
        {copied ? "kopyalandı" : "Saati kopyala"}
      </button>
    </div>
  );
}
