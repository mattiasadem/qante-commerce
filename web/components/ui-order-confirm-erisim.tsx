"use client";

import { parseErisimFromNote } from "@/components/ui-erisim";

/** /siparis confirm: building-access preference from checkout note. */
export function OrderConfirmErisimSummary({ note }: { note?: string }) {
  const erisim = parseErisimFromNote(note);
  if (!erisim) return null;
  return (
    <p className="muted" data-cta="erisim-summary" style={{ marginTop: 6 }}>
      Erişim · {erisim.label}
    </p>
  );
}
