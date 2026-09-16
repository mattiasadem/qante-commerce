"use client";

import { useState } from "react";
import { parsePaketmatikFromNote } from "@/components/ui-paketmatik";

/** Siparişlerim row: Paketmatik locker preference from checkout note with copy CTA. */
export function MyOrderPaketmatikLine({ note }: { note?: string }) {
  const paketmatik = parsePaketmatikFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!paketmatik) return null;

  const label = `Paketmatik · ${paketmatik.label}`;

  async function copyPaketmatik() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-paketmatik" style={{ marginTop: 6 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-paketmatik-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyPaketmatik()}
      >
        {copied ? "kopyalandı" : "Paketmatiği kopyala"}
      </button>
    </div>
  );
}
