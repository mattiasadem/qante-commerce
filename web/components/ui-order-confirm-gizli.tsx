"use client";

import { parseGizliFromNote } from "@/components/ui-gizli";

/** /siparis confirm: privacy packaging preference from checkout note. */
export function OrderConfirmGizliSummary({ note }: { note?: string }) {
  const gizli = parseGizliFromNote(note);
  if (!gizli) return null;
  return (
    <p className="muted" data-cta="gizli-summary" style={{ marginTop: 6 }}>
      Gizlilik · {gizli.label}
    </p>
  );
}
