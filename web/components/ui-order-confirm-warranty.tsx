"use client";

import { useState } from "react";
import { parseWarrantyFromNote } from "@/components/ui-warranty";

/** /siparis confirm: warranty extension preference from checkout note with copy CTA. */
export function OrderConfirmWarrantySummary({ note }: { note?: string }) {
  const warranty = parseWarrantyFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!warranty) return null;

  async function copyWarranty() {
    try {
      await navigator.clipboard.writeText(warranty.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <p className="muted" data-cta="warranty-summary" style={{ marginTop: 6 }}>
      Garanti · {warranty.label}
      <button
        className="chip"
        type="button"
        data-cta="warranty-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyWarranty()}
      >
        {copied ? "kopyalandı" : "Garantiyi kopyala"}
      </button>
    </p>
  );
}
