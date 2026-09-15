"use client";

import { useState } from "react";
import { parseMontajFromNote } from "@/components/ui-montaj";

/** Siparişlerim row: assembly preference from checkout note with copy CTA. */
export function MyOrderMontajLine({ note }: { note?: string }) {
  const montaj = parseMontajFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!montaj) return null;

  async function copyMontaj() {
    try {
      await navigator.clipboard.writeText(montaj.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-montaj" style={{ marginTop: 6 }}>
      Montaj · {montaj.label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-montaj-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyMontaj()}
      >
        {copied ? "kopyalandı" : "Montajı kopyala"}
      </button>
    </div>
  );
}
