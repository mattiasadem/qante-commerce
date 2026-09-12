"use client";

import { parseImzaFromNote } from "@/components/ui-imza";

/** Siparişlerim row: signature delivery preference from checkout note. */
export function MyOrderImzaLine({ note }: { note?: string }) {
  const imza = parseImzaFromNote(note);
  if (!imza) return null;
  return (
    <div className="faint" data-cta="my-orders-imza">
      İmza · {imza.label}
    </div>
  );
}
