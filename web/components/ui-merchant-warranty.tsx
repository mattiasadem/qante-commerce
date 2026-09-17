"use client";

import { useState } from "react";
import { parseWarrantyFromNote } from "@/components/ui-warranty";

/** Merchant Siparişler row: warranty extension preference from checkout note with copy CTA. */
export function MerchantWarrantyLine({ note }: { note?: string }) {
  const warranty = parseWarrantyFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!warranty) return null;

  const label = `Garanti · ${warranty.label}`;

  async function copyGaranti() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-warranty" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-garanti-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyGaranti()}
      >
        {copied ? "kopyalandı" : "Garantiyi kopyala"}
      </button>
    </div>
  );
}
