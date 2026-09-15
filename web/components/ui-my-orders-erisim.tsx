"use client";

import { useState } from "react";
import { parseErisimFromNote } from "@/components/ui-erisim";

/** Siparişlerim row: building access preference from checkout note with copy CTA. */
export function MyOrderErisimLine({ note }: { note?: string }) {
  const erisim = parseErisimFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!erisim) return null;

  async function copyErisim() {
    try {
      await navigator.clipboard.writeText(erisim.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-erisim" style={{ marginTop: 6 }}>
      Erişim · {erisim.label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-erisim-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyErisim()}
      >
        {copied ? "kopyalandı" : "Erişimi kopyala"}
      </button>
    </div>
  );
}
