"use client";

import { parseShipModeFromNote } from "@/components/ui-ship-mode";

/** /siparis confirm: delivery shape (Kargo / Gel al) from checkout note. */
export function OrderConfirmSekilSummary({ note }: { note?: string }) {
  const sekil = parseShipModeFromNote(note);
  if (!sekil) return null;
  return (
    <p className="muted" data-cta="sekil-summary" style={{ marginTop: 6 }}>
      Teslim şekli · {sekil.label}
    </p>
  );
}
