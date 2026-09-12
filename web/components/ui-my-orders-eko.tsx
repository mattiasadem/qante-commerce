"use client";

import { parseEcoFromNote } from "@/components/ui-eco";

/** Siparişlerim row: eco packaging preference from checkout note. */
export function MyOrderEcoLine({ note }: { note?: string }) {
  const eco = parseEcoFromNote(note);
  if (!eco) return null;
  return (
    <div className="faint" data-cta="my-orders-eco">
      Eko · {eco.label}
    </div>
  );
}
