"use client";

import { useState } from "react";
import { parseReturnFromNote } from "@/components/ui-return";

/** Siparişlerim row: easy-return preference from checkout note with copy CTA. */
export function MyOrderIadeLine({ note }: { note?: string }) {
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
    <div className="faint" data-cta="my-orders-return" style={{ marginTop: 6 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-iade-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyIade()}
      >
        {copied ? "kopyalandı" : "İadeyi kopyala"}
      </button>
    </div>
  );
}
