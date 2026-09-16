"use client";

import { useState } from "react";
import { parseContactFromNote } from "@/components/ui-contact";

/** Siparişlerim row: contact preference from checkout note with copy CTA. */
export function MyOrderIletisimLine({ note }: { note?: string }) {
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
    <div className="faint" data-cta="my-orders-iletisim" style={{ marginTop: 6 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-iletisim-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyIletisim()}
      >
        {copied ? "kopyalandı" : "İletişimi kopyala"}
      </button>
    </div>
  );
}
