"use client";

import { useState } from "react";
import { parseReturnFromNote } from "@/components/ui-return";

/** /siparis confirm: kolay iade preference from checkout note with copy CTA. */
export function OrderConfirmReturnSummary({ note }: { note?: string }) {
  const ret = parseReturnFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!ret) return null;

  async function copyReturn() {
    try {
      await navigator.clipboard.writeText(ret.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <p className="muted" data-cta="return-summary" style={{ marginTop: 6 }}>
      Kolay iade · {ret.label}
      <button
        className="chip"
        type="button"
        data-cta="return-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyReturn()}
      >
        {copied ? "kopyalandı" : "İadeyi kopyala"}
      </button>
    </p>
  );
}
