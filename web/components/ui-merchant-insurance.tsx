"use client";

import { useState } from "react";
import { parseInsuranceFromNote } from "@/components/ui-insurance";

/** Merchant Siparişler row: cargo insurance preference from checkout note with copy CTA. */
export function MerchantInsuranceLine({ note }: { note?: string }) {
  const insurance = parseInsuranceFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!insurance) return null;

  const label = `Sigorta · ${insurance.label}`;

  async function copySigorta() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-insurance" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-sigorta-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copySigorta()}
      >
        {copied ? "kopyalandı" : "Sigortayı kopyala"}
      </button>
    </div>
  );
}
