"use client";

import { useState } from "react";
import { parseImzaFromNote } from "@/components/ui-imza";

/** Siparişlerim row: signature delivery preference from checkout note with copy CTA. */
export function MyOrderImzaLine({ note }: { note?: string }) {
  const imza = parseImzaFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!imza) return null;

  async function copyImza() {
    try {
      await navigator.clipboard.writeText(imza.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-imza" style={{ marginTop: 6 }}>
      İmza · {imza.label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-imza-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyImza()}
      >
        {copied ? "kopyalandı" : "İmzayı kopyala"}
      </button>
    </div>
  );
}
