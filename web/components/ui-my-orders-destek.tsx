"use client";

import { parseDestekFromNote } from "@/components/ui-destek";

/** Siparişlerim row: prioritized support preference from checkout note. */
export function MyOrderDestekLine({ note }: { note?: string }) {
  const destek = parseDestekFromNote(note);
  if (!destek) return null;
  return (
    <div className="faint" data-cta="my-orders-destek">
      Destek · {destek.label}
    </div>
  );
}
