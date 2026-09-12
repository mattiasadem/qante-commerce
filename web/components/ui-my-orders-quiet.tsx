"use client";

import { parseQuietFromNote } from "@/components/ui-quiet";

/** Siparişlerim row: quiet/doorbell preference from checkout note. */
export function MyOrderQuietLine({ note }: { note?: string }) {
  const quiet = parseQuietFromNote(note);
  if (!quiet) return null;
  return (
    <div className="faint" data-cta="my-orders-quiet">
      Zil · {quiet.label}
    </div>
  );
}
