"use client";

import { parseShipModeFromNote } from "@/components/ui-ship-mode";

/** Siparişlerim row: delivery shape from checkout note. */
export function MyOrderSekilLine({ note }: { note?: string }) {
  const sekil = parseShipModeFromNote(note);
  if (!sekil) return null;
  return (
    <div className="faint" data-cta="my-orders-sekil">
      Teslim şekli · {sekil.label}
    </div>
  );
}
