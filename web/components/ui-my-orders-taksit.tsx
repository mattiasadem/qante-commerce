"use client";

import { useState } from "react";
import { parseTaksitFromNote } from "@/components/ui-taksit";

/** Siparişlerim row: installment preference from checkout note with copy CTA. */
export function MyOrderTaksitLine({ note }: { note?: string }) {
  const taksit = parseTaksitFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!taksit) return null;

  async function copyTaksit() {
    try {
      await navigator.clipboard.writeText(taksit.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-taksit" style={{ marginTop: 6 }}>
      Taksit · {taksit.label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-taksit-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyTaksit()}
      >
        {copied ? "kopyalandı" : "Taksiti kopyala"}
      </button>
    </div>
  );
}
