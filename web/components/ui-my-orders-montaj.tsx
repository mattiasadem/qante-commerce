"use client";

import { parseMontajFromNote } from "@/components/ui-montaj";

/** Siparişlerim row: assembly preference from checkout note. */
export function MyOrderMontajLine({ note }: { note?: string }) {
  const montaj = parseMontajFromNote(note);
  if (!montaj) return null;
  return (
    <div className="faint" data-cta="my-orders-montaj">
      Montaj · {montaj.label}
    </div>
  );
}
