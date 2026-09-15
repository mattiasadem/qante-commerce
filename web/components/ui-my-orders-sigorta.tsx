"use client";

import { useState } from "react";
import { parseInsuranceFromNote } from "@/components/ui-insurance";

/** Siparişlerim row: cargo insurance preference from checkout note with copy CTA. */
export function MyOrderSigortaLine({ note }: { note?: string }) {
  const insurance = parseInsuranceFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!insurance) return null;

  async function copyInsurance() {
    try {
      await navigator.clipboard.writeText(insurance.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-insurance" style={{ marginTop: 6 }}>
      Sigorta · {insurance.label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-insurance-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyInsurance()}
      >
        {copied ? "kopyalandı" : "Sigortayı kopyala"}
      </button>
    </div>
  );
}
