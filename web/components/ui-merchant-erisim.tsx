"use client";

import { useState } from "react";
import { parseErisimFromNote } from "@/components/ui-erisim";

/** Merchant Siparişler row: building-access preference from checkout note with copy CTA. */
export function MerchantErisimLine({ note }: { note?: string }) {
  const erisim = parseErisimFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!erisim) return null;

  const label = `Erişim · ${erisim.label}`;

  async function copyErisim() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-erisim" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-erisim-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyErisim()}
      >
        {copied ? "kopyalandı" : "Erişimi kopyala"}
      </button>
    </div>
  );
}
