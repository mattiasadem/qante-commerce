"use client";

import { useState } from "react";
import { parseContactFromNote } from "@/components/ui-contact";

/** Merchant Siparişler row: contact preference from checkout note with copy CTA. */
export function MerchantIletisimLine({ note }: { note?: string }) {
  const iletisim = parseContactFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!iletisim) return null;

  const label = `İletişim · ${iletisim.label}`;

  async function copyIletisim() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-iletisim" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-iletisim-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyIletisim()}
      >
        {copied ? "kopyalandı" : "İletişimi kopyala"}
      </button>
    </div>
  );
}
