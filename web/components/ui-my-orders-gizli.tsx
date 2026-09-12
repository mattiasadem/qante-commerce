"use client";

import { parseGizliFromNote } from "@/components/ui-gizli";

/** Siparişlerim row: privacy packaging preference from checkout note. */
export function MyOrderGizliLine({ note }: { note?: string }) {
  const gizli = parseGizliFromNote(note);
  if (!gizli) return null;
  return (
    <div className="faint" data-cta="my-orders-gizli">
      Gizlilik · {gizli.label}
    </div>
  );
}
