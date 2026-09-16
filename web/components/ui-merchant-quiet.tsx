"use client";

import { useState } from "react";
import { parseQuietFromNote } from "@/components/ui-quiet";

/** Merchant Siparişler row: quiet/doorbell preference from checkout note with copy CTA. */
export function MerchantQuietLine({ note }: { note?: string }) {
  const quiet = parseQuietFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!quiet) return null;

  const label = `Zil · ${quiet.label}`;

  async function copyQuiet() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-quiet" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-quiet-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyQuiet()}
      >
        {copied ? "kopyalandı" : "Zili kopyala"}
      </button>
    </div>
  );
}
