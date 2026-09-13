"use client";

import { parseTaksitFromNote } from "@/components/ui-taksit";

/** /siparis confirm: installment preference from checkout note. */
export function OrderConfirmTaksitSummary({ note }: { note?: string }) {
  const taksit = parseTaksitFromNote(note);
  if (!taksit) return null;
  return (
    <p className="muted" data-cta="taksit-summary" style={{ marginTop: 6 }}>
      Taksit · {taksit.label}
    </p>
  );
}
