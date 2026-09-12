"use client";

import { parseReturnFromNote } from "@/components/ui-return";

/** Siparişlerim row: easy-return preference from checkout note. */
export function MyOrderIadeLine({ note }: { note?: string }) {
  const ret = parseReturnFromNote(note);
  if (!ret) return null;
  return (
    <div className="faint" data-cta="my-orders-return">
      Kolay iade · {ret.label}
    </div>
  );
}
