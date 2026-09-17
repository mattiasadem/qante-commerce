"use client";

import { useState } from "react";
import { parseShipCarrierFromNote } from "@/components/ui-ship-carrier";

/** Merchant Siparişler row: preferred carrier from checkout note with copy CTA. */
export function MerchantFirmaLine({ note }: { note?: string }) {
  const firma = parseShipCarrierFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!firma) return null;

  const label = `Firma · ${firma.label}`;

  async function copyFirma() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-firma" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-firma-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyFirma()}
      >
        {copied ? "kopyalandı" : "Firmayı kopyala"}
      </button>
    </div>
  );
}
