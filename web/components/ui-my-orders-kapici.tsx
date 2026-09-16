"use client";

import { useState } from "react";
import { parseDoormanFromNote } from "@/components/ui-doorman";

/** Siparişlerim row: doorman / leave-with-kapıcı preference from checkout note with copy CTA. */
export function MyOrderKapiciLine({ note }: { note?: string }) {
  const doorman = parseDoormanFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!doorman) return null;

  const label = `Kapıcı · ${doorman.note || "Kapıcıya bırak"}`;

  async function copyKapici() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-doorman" style={{ marginTop: 6 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-kapici-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyKapici()}
      >
        {copied ? "kopyalandı" : "Kapıcıyı kopyala"}
      </button>
    </div>
  );
}
