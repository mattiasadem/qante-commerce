"use client";

import { useState } from "react";
import { parseAmbalajFromNote } from "@/components/ui-ambalaj";

/** Merchant Siparişler row: packaging preference from checkout note with copy CTA. */
export function MerchantAmbalajLine({ note }: { note?: string }) {
  const a = parseAmbalajFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!a) return null;

  const label = `Ambalaj · ${a.label}`;

  async function copyAmbalaj() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-ambalaj" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-ambalaj-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyAmbalaj()}
      >
        {copied ? "kopyalandı" : "Ambalajı kopyala"}
      </button>
    </div>
  );
}
