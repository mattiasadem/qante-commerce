"use client";

import { useState } from "react";
import { parseReturnFromNote } from "@/components/ui-return";

/** Merchant Siparişler row: easy-return window from checkout note with copy CTA. */
export function MerchantReturnLine({ note }: { note?: string }) {
  const ret = parseReturnFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!ret) return null;

  const label = `Kolay iade · ${ret.label}`;

  async function copyIade() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-return" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-iade-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyIade()}
      >
        {copied ? "kopyalandı" : "İadeyi kopyala"}
      </button>
    </div>
  );
}
