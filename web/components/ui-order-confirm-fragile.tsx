"use client";

import { parseFragileFromNote } from "@/components/ui-fragile";

/** /siparis confirm: fragile pack preference from checkout note. */
export function OrderConfirmFragileSummary({ note }: { note?: string }) {
  const frag = parseFragileFromNote(note);
  if (!frag) return null;
  return (
    <p className="muted" data-cta="fragile-summary" style={{ marginTop: 6 }}>
      Kırılgan paket · {frag.label}
    </p>
  );
}
