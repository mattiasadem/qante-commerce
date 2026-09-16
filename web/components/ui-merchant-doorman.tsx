"use client";

import { useState } from "react";
import { parseDoormanFromNote } from "@/components/ui-doorman";

/** Merchant Siparişler row: leave-with-doorman preference from checkout note with copy CTA. */
export function MerchantDoormanLine({ note }: { note?: string }) {
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
    <div className="faint" data-cta="merchant-doorman" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-kapici-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyKapici()}
      >
        {copied ? "kopyalandı" : "Kapıcıyı kopyala"}
      </button>
    </div>
  );
}
