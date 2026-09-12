"use client";

import { parseReturnFromNote } from "@/components/ui-return";

/** /siparis confirm: kolay iade preference from checkout note. */
export function OrderConfirmReturnSummary({ note }: { note?: string }) {
  const ret = parseReturnFromNote(note);
  if (!ret) return null;
  return (
    <p className="muted" data-cta="return-summary" style={{ marginTop: 6 }}>
      Kolay iade · {ret.label}
    </p>
  );
}
