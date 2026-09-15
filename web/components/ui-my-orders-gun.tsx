"use client";

import { useState } from "react";
import { parseShipDayFromNote } from "@/components/ui-ship-day";

/** Siparişlerim row: delivery day from checkout note with copy CTA. */
export function MyOrderGunLine({ note }: { note?: string }) {
  const gun = parseShipDayFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!gun) return null;

  async function copyGun() {
    try {
      await navigator.clipboard.writeText(gun.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-gun" style={{ marginTop: 6 }}>
      Teslimat günü · {gun.label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-gun-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyGun()}
      >
        {copied ? "kopyalandı" : "Günü kopyala"}
      </button>
    </div>
  );
}
