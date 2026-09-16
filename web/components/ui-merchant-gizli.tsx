"use client";

import { useState } from "react";
import { parseGizliFromNote } from "@/components/ui-gizli";

/** Merchant Siparişler row: privacy pack preference from checkout note with copy CTA. */
export function MerchantGizliLine({ note }: { note?: string }) {
  const g = parseGizliFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!g) return null;

  const label = `Gizlilik · ${g.label}`;

  async function copyGizli() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-gizli" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-gizli-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyGizli()}
      >
        {copied ? "kopyalandı" : "Gizliliği kopyala"}
      </button>
    </div>
  );
}
