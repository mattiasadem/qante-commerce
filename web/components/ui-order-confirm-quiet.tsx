"use client";

import { useState } from "react";
import { parseQuietFromNote } from "@/components/ui-quiet";

/** /siparis confirm: quiet/doorbell preference from checkout note with copy CTA. */
export function OrderConfirmQuietSummary({ note }: { note?: string }) {
  const quiet = parseQuietFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!quiet) return null;

  async function copyQuiet() {
    try {
      await navigator.clipboard.writeText(quiet.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <p className="muted" data-cta="quiet-summary" style={{ marginTop: 6 }}>
      Zil · {quiet.label}
      <button
        className="chip"
        type="button"
        data-cta="quiet-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyQuiet()}
      >
        {copied ? "kopyalandı" : "Zili kopyala"}
      </button>
    </p>
  );
}
