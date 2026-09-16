"use client";

import { useState } from "react";
import { parseGiftFromNote } from "@/components/ui-gift";

/** Merchant Siparişler row: gift wrap from checkout note with copy CTA. */
export function MerchantGiftLine({ note }: { note?: string }) {
  const g = parseGiftFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!g) return null;

  const label = g.note ? `Hediye paketi · ${g.note}` : "Hediye paketi";

  async function copyGift() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-gift" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-gift-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyGift()}
      >
        {copied ? "kopyalandı" : "Hediyeyi kopyala"}
      </button>
    </div>
  );
}
