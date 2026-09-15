"use client";

import { useState } from "react";
import { parseAmbalajFromNote } from "@/components/ui-ambalaj";

/** Siparişlerim row: packaging preference from checkout note with copy CTA. */
export function MyOrderAmbalajLine({ note }: { note?: string }) {
  const ambalaj = parseAmbalajFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!ambalaj) return null;

  async function copyAmbalaj() {
    try {
      await navigator.clipboard.writeText(ambalaj.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-ambalaj" style={{ marginTop: 6 }}>
      Ambalaj · {ambalaj.label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-ambalaj-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyAmbalaj()}
      >
        {copied ? "kopyalandı" : "Ambalajı kopyala"}
      </button>
    </div>
  );
}
