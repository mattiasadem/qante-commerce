"use client";

import { parseAmbalajFromNote } from "@/components/ui-ambalaj";

/** /siparis confirm: packaging preference from checkout note. */
export function OrderConfirmAmbalajSummary({ note }: { note?: string }) {
  const pack = parseAmbalajFromNote(note);
  if (!pack) return null;
  return (
    <p className="muted" data-cta="ambalaj-summary" style={{ marginTop: 6 }}>
      Ambalaj · {pack.label}
    </p>
  );
}
