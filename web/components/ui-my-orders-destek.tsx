"use client";

import { useState } from "react";
import { parseDestekFromNote } from "@/components/ui-destek";

/** Siparişlerim row: prioritized support preference from checkout note with copy CTA. */
export function MyOrderDestekLine({ note }: { note?: string }) {
  const destek = parseDestekFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!destek) return null;

  async function copyDestek() {
    try {
      await navigator.clipboard.writeText(destek.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-destek" style={{ marginTop: 6 }}>
      Destek · {destek.label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-destek-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyDestek()}
      >
        {copied ? "kopyalandı" : "Desteği kopyala"}
      </button>
    </div>
  );
}
