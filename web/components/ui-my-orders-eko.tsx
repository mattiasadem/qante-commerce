"use client";

import { useState } from "react";
import { parseEcoFromNote } from "@/components/ui-eco";

/** Siparişlerim row: eco packaging preference from checkout note with copy CTA. */
export function MyOrderEcoLine({ note }: { note?: string }) {
  const eco = parseEcoFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!eco) return null;

  async function copyEco() {
    try {
      await navigator.clipboard.writeText(eco.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-eco" style={{ marginTop: 6 }}>
      Eko · {eco.label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-eco-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyEco()}
      >
        {copied ? "kopyalandı" : "Eko'yu kopyala"}
      </button>
    </div>
  );
}
