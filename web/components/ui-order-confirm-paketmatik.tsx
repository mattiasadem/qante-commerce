"use client";

import { parsePaketmatikFromNote } from "@/components/ui-paketmatik";

/** /siparis confirm: paketmatik preference from checkout note. */
export function OrderConfirmPaketmatikSummary({ note }: { note?: string }) {
  const pk = parsePaketmatikFromNote(note);
  if (!pk) return null;
  return (
    <p className="muted" data-cta="paketmatik-summary" style={{ marginTop: 6 }}>
      Paketmatik · {pk.label}
    </p>
  );
}
