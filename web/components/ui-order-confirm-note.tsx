"use client";

import { useState } from "react";

/** Strip structured [tag:value] tokens; leftover freeform checkout text. */
export function parseFreeformNote(note?: string): string | null {
  if (!note) return null;
  const free = note.replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim();
  if (!free) return null;
  return free.slice(0, 160);
}

/** /siparis confirm: freeform buyer note after structured tags are parsed elsewhere. */
export function OrderConfirmNoteSummary({ note }: { note?: string }) {
  const free = parseFreeformNote(note);
  const [copied, setCopied] = useState(false);
  if (!free) return null;

  async function copyNote() {
    try {
      await navigator.clipboard.writeText(free);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <p className="muted" data-cta="note-summary" style={{ marginTop: 6 }}>
      Sipariş notu · {free}
      <button
        className="chip"
        type="button"
        data-cta="note-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyNote()}
      >
        {copied ? "kopyalandı" : "Notu kopyala"}
      </button>
    </p>
  );
}
