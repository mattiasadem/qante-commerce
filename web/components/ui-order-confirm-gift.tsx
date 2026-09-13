"use client";

import { useState } from "react";
import { parseGiftFromNote } from "@/components/ui-gift";

/** /siparis confirm: gift wrap preference from checkout note with copy CTA. */
export function OrderConfirmGiftSummary({ note }: { note?: string }) {
  const gift = parseGiftFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!gift) return null;

  const label = gift.note ? `Hediye paketi · ${gift.note}` : "Hediye paketi";

  async function copyGift() {
    try {
      await navigator.clipboard.writeText(gift.note ? gift.note : "Hediye paketi");
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <p className="muted" data-cta="gift-summary" style={{ marginTop: 6 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="gift-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyGift()}
      >
        {copied ? "kopyalandı" : "Hediyeyi kopyala"}
      </button>
    </p>
  );
}
