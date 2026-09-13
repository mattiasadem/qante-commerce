"use client";

import { parseImzaFromNote } from "@/components/ui-imza";

/** /siparis confirm: signature preference from checkout note. */
export function OrderConfirmImzaSummary({ note }: { note?: string }) {
  const imza = parseImzaFromNote(note);
  if (!imza) return null;
  return (
    <p className="muted" data-cta="imza-summary" style={{ marginTop: 6 }}>
      İmza teslimatı · {imza.label}
    </p>
  );
}
