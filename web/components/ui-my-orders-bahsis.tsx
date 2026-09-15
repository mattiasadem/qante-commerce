"use client";

import { useState } from "react";
import { parseTipFromNote } from "@/components/ui-tip";

/** Siparişlerim row: courier tip preference from checkout note with copy CTA. */
export function MyOrderBahsisLine({ note }: { note?: string }) {
  const tip = parseTipFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!tip) return null;

  async function copyBahsis() {
    try {
      await navigator.clipboard.writeText(tip.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-bahsis" style={{ marginTop: 6 }}>
      Bahşiş · {tip.label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-bahsis-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyBahsis()}
      >
        {copied ? "kopyalandı" : "Bahşişi kopyala"}
      </button>
    </div>
  );
}
