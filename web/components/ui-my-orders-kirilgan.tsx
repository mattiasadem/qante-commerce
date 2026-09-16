"use client";

import { useState } from "react";
import { parseFragileFromNote } from "@/components/ui-fragile";

/** Siparişlerim row: fragile packing preference from checkout note with copy CTA. */
export function MyOrderKirilganLine({ note }: { note?: string }) {
  const fragile = parseFragileFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!fragile) return null;

  const label = `Kırılgan · ${fragile.label}`;

  async function copyKirilgan() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-fragile" style={{ marginTop: 6 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-kirilgan-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyKirilgan()}
      >
        {copied ? "kopyalandı" : "Kırılganı kopyala"}
      </button>
    </div>
  );
}
