"use client";
import { useState } from "react";
import { CARRIERS, formatShipNote, parseShipNote, shipNoteLabel } from "@/lib/ship-track";

export { CARRIERS, formatShipNote, parseShipNote, shipNoteLabel };

/** Buyer-facing Turkish cargo tracking banner with copy-code CTA. */
export function ShipTrackBanner({ shipNote }: { shipNote?: string }) {
  const parsed = parseShipNote(shipNote);
  const [copied, setCopied] = useState(false);
  if (!parsed) return null;
  const line = shipNoteLabel(shipNote) ?? "";

  async function copyCode() {
    if (!parsed?.tracking) return;
    try {
      await navigator.clipboard.writeText(parsed.tracking);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <p className="muted" data-cta="ship-track-banner" style={{ marginTop: 8 }}>
      Kargo takip · <strong>{line}</strong>
      {parsed.tracking ? (
        <button className="chip" type="button" style={{ marginLeft: 10 }} onClick={() => void copyCode()}>
          {copied ? "kopyalandı" : "Kodu kopyala"}
        </button>
      ) : null}
      <span className="faint"> · yerel defter · ikas&apos;a gitmedi</span>
    </p>
  );
}
