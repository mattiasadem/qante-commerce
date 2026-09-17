"use client";

import { useState } from "react";
import { parseShipDayFromNote } from "@/components/ui-ship-day";

/** Merchant Siparişler row: delivery day from checkout note with copy CTA. */
export function MerchantGunLine({ note }: { note?: string }) {
  const gun = parseShipDayFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!gun) return null;

  const label = `Gün · ${gun.label}`;

  async function copyGun() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-gun" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-gun-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyGun()}
      >
        {copied ? "kopyalandı" : "Günü kopyala"}
      </button>
    </div>
  );
}
