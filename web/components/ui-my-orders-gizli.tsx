"use client";

import { useState } from "react";
import { parseGizliFromNote } from "@/components/ui-gizli";

/** Siparişlerim row: privacy packaging preference from checkout note with copy CTA. */
export function MyOrderGizliLine({ note }: { note?: string }) {
  const gizli = parseGizliFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!gizli) return null;

  const label = `Gizlilik · ${gizli.label}`;

  async function copyGizli() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-gizli" style={{ marginTop: 6 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-gizli-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyGizli()}
      >
        {copied ? "kopyalandı" : "Gizliliği kopyala"}
      </button>
    </div>
  );
}
