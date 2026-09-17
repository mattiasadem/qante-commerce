"use client";

import { useState } from "react";
import { parseRecipientFromNote } from "@/components/ui-recipient";

/** Merchant Siparişler row: alternate recipient from checkout note with copy CTA. */
export function MerchantRecipientLine({ note }: { note?: string }) {
  const alici = parseRecipientFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!alici) return null;

  const label = `Alıcı · ${alici.label}`;

  async function copyAlici() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-recipient" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-alici-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyAlici()}
      >
        {copied ? "kopyalandı" : "Alıcıyı kopyala"}
      </button>
    </div>
  );
}
