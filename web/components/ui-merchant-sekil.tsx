"use client";

import { useState } from "react";
import { parseShipModeFromNote } from "@/components/ui-ship-mode";

/** Merchant Siparişler row: delivery shape from checkout note with copy CTA. */
export function MerchantSekilLine({ note }: { note?: string }) {
  const sekil = parseShipModeFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!sekil) return null;

  const label = `Teslim şekli · ${sekil.label}`;

  async function copySekil() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-sekil" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-sekil-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copySekil()}
      >
        {copied ? "kopyalandı" : "Şekli kopyala"}
      </button>
    </div>
  );
}
