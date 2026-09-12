"use client";

import { parseQuietFromNote } from "@/components/ui-quiet";

/** /siparis confirm: quiet/doorbell preference from checkout note. */
export function OrderConfirmQuietSummary({ note }: { note?: string }) {
  const quiet = parseQuietFromNote(note);
  if (!quiet) return null;
  return (
    <p className="muted" data-cta="quiet-summary" style={{ marginTop: 6 }}>
      Zil · {quiet.label}
    </p>
  );
}
