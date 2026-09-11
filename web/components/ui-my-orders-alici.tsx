"use client";

import { parseRecipientFromNote } from "@/components/ui-recipient";

/** Siparişlerim row: alternate recipient preference from checkout note. */
export function MyOrderAliciLine({ note }: { note?: string }) {
  const alici = parseRecipientFromNote(note);
  if (!alici) return null;
  return (
    <div className="faint" data-cta="my-orders-alici">
      Alıcı · {alici.label}
    </div>
  );
}
