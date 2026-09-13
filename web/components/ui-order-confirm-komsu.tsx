"use client";

import { parseKomsuFromNote } from "@/components/ui-komsu";

/** /siparis confirm: neighbor-delivery preference from checkout note. */
export function OrderConfirmKomsuSummary({ note }: { note?: string }) {
  const komsu = parseKomsuFromNote(note);
  if (!komsu) return null;
  return (
    <p className="muted" data-cta="komsu-summary" style={{ marginTop: 6 }}>
      Komşu teslimatı · {komsu.label}
    </p>
  );
}
