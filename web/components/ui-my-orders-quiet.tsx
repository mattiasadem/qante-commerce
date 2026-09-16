"use client";

import { useState } from "react";
import { parseQuietFromNote } from "@/components/ui-quiet";

/** Siparişlerim row: quiet/doorbell preference from checkout note with copy CTA. */
export function MyOrderQuietLine({ note }: { note?: string }) {
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
    <div className="faint" data-cta="my-orders-quiet" style={{ marginTop: 6 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-quiet-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyQuiet()}
      >
        {copied ? "kopyalandı" : "Zili kopyala"}
      </button>
    </div>
  );
}
