"use client";

import { useState } from "react";
import { parseImzaFromNote } from "@/components/ui-imza";

/** Merchant Siparişler row: signature delivery preference from checkout note with copy CTA. */
export function MerchantImzaLine({ note }: { note?: string }) {
  const imza = parseImzaFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!imza) return null;

  const label = `İmza · ${imza.label}`;

  async function copyImza() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-imza" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-imza-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyImza()}
      >
        {copied ? "kopyalandı" : "İmzayı kopyala"}
      </button>
    </div>
  );
}
