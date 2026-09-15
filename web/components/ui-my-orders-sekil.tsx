"use client";

import { useState } from "react";
import { parseShipModeFromNote } from "@/components/ui-ship-mode";

/** Siparişlerim row: delivery shape from checkout note with copy CTA. */
export function MyOrderSekilLine({ note }: { note?: string }) {
  const sekil = parseShipModeFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!sekil) return null;

  async function copySekil() {
    try {
      await navigator.clipboard.writeText(sekil.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-sekil" style={{ marginTop: 6 }}>
      Teslim şekli · {sekil.label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-sekil-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copySekil()}
      >
        {copied ? "kopyalandı" : "Şekli kopyala"}
      </button>
    </div>
  );
}
