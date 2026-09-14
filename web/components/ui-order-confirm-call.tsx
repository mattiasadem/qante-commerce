"use client";

import { useState } from "react";
import { parseCallFromNote } from "@/components/ui-call";

/** /siparis confirm: pre-delivery call preference from checkout note with copy CTA. */
export function OrderConfirmCallSummary({ note }: { note?: string }) {
  const call = parseCallFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!call) return null;

  async function copyCall() {
    try {
      await navigator.clipboard.writeText(call.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <p className="muted" data-cta="call-summary" style={{ marginTop: 6 }}>
      Ara · {call.label}
      <button
        className="chip"
        type="button"
        data-cta="call-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyCall()}
      >
        {copied ? "kopyalandı" : "Aramayı kopyala"}
      </button>
    </p>
  );
}
