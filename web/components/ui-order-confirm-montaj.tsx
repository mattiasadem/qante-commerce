"use client";

import { parseMontajFromNote } from "@/components/ui-montaj";

/** /siparis confirm: assembly preference from checkout note. */
export function OrderConfirmMontajSummary({ note }: { note?: string }) {
  const montaj = parseMontajFromNote(note);
  if (!montaj) return null;
  return (
    <p className="muted" data-cta="montaj-summary" style={{ marginTop: 6 }}>
      Montaj hizmeti · {montaj.label}
    </p>
  );
}
