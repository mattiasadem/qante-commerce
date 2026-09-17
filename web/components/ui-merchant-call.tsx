"use client";

import { useState } from "react";
import { parseCallFromNote } from "@/components/ui-call";

/** Merchant Siparişler row: pre-delivery call preference from checkout note with copy CTA. */
export function MerchantCallLine({ note }: { note?: string }) {
  const call = parseCallFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!call) return null;

  const label = `Ara · ${call.label}`;

  async function copyAra() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-call" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-call-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyAra()}
      >
        {copied ? "kopyalandı" : "Arayı kopyala"}
      </button>
    </div>
  );
}
