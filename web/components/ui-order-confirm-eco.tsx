"use client";

import { parseEcoFromNote } from "@/components/ui-eco";

/** /siparis confirm: eco pack preference from checkout note. */
export function OrderConfirmEcoSummary({ note }: { note?: string }) {
  const eco = parseEcoFromNote(note);
  if (!eco) return null;
  return (
    <p className="muted" data-cta="eco-summary" style={{ marginTop: 6 }}>
      Çevre paketi · {eco.label}
    </p>
  );
}
