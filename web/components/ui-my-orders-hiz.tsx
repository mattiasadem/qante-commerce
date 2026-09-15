"use client";

import { useState } from "react";
import { parseShipSpeedFromNote } from "@/components/ui-ship-speed";

/** Siparişlerim row: delivery speed from checkout note with copy CTA. */
export function MyOrderHizLine({ note }: { note?: string }) {
  const hiz = parseShipSpeedFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!hiz) return null;

  async function copyHiz() {
    try {
      await navigator.clipboard.writeText(hiz.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-hiz" style={{ marginTop: 6 }}>
      Teslimat hızı · {hiz.label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-hiz-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyHiz()}
      >
        {copied ? "kopyalandı" : "Hızı kopyala"}
      </button>
    </div>
  );
}
