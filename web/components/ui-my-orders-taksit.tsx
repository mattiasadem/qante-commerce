"use client";

import { parseTaksitFromNote } from "@/components/ui-taksit";

/** Siparişlerim row: installment preference from checkout note. */
export function MyOrderTaksitLine({ note }: { note?: string }) {
  const taksit = parseTaksitFromNote(note);
  if (!taksit) return null;
  return (
    <div className="faint" data-cta="my-orders-taksit">
      Taksit · {taksit.label}
    </div>
  );
}
