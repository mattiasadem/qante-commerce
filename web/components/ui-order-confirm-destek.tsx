"use client";

import { parseDestekFromNote } from "@/components/ui-destek";

/** /siparis confirm: prioritized support preference from checkout note. */
export function OrderConfirmDestekSummary({ note }: { note?: string }) {
  const destek = parseDestekFromNote(note);
  if (!destek) return null;
  return (
    <p className="muted" data-cta="destek-summary" style={{ marginTop: 6 }}>
      Destek · {destek.label}
    </p>
  );
}
