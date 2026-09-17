"use client";

import { useState } from "react";
import { parseDestekFromNote } from "@/components/ui-destek";

/** Merchant Siparişler row: priority support preference from checkout note with copy CTA. */
export function MerchantDestekLine({ note }: { note?: string }) {
  const destek = parseDestekFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!destek) return null;

  const label = `Destek · ${destek.label}`;

  async function copyDestek() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-destek" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-destek-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyDestek()}
      >
        {copied ? "kopyalandı" : "Desteği kopyala"}
      </button>
    </div>
  );
}
