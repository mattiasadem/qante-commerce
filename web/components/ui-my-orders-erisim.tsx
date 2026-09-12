"use client";

import { parseErisimFromNote } from "@/components/ui-erisim";

/** Siparişlerim row: building access preference from checkout note. */
export function MyOrderErisimLine({ note }: { note?: string }) {
  const erisim = parseErisimFromNote(note);
  if (!erisim) return null;
  return (
    <div className="faint" data-cta="my-orders-erisim">
      Erişim · {erisim.label}
    </div>
  );
}
