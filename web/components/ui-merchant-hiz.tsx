"use client";

import { useState } from "react";
import { parseShipSpeedFromNote } from "@/components/ui-ship-speed";

/** Merchant Siparişler row: delivery speed from checkout note with copy CTA. */
export function MerchantHizLine({ note }: { note?: string }) {
  const hiz = parseShipSpeedFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!hiz) return null;

  const label = `Hız · ${hiz.label}`;

  async function copyHiz() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-hiz" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-hiz-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyHiz()}
      >
        {copied ? "kopyalandı" : "Hızı kopyala"}
      </button>
    </div>
  );
}
