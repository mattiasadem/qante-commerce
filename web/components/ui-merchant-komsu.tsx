"use client";

import { useState } from "react";
import { parseKomsuFromNote } from "@/components/ui-komsu";

/** Merchant Siparişler row: neighbor-delivery preference from checkout note with copy CTA. */
export function MerchantKomsuLine({ note }: { note?: string }) {
  const komsu = parseKomsuFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!komsu) return null;

  const label = `Komşu · ${komsu.label}`;

  async function copyKomsu() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-komsu" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-komsu-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyKomsu()}
      >
        {copied ? "kopyalandı" : "Komşuyu kopyala"}
      </button>
    </div>
  );
}
