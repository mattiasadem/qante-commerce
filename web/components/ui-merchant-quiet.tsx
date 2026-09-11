"use client";

import { parseQuietFromNote } from "@/components/ui-quiet";

/** Merchant Siparişler row: highlight quiet-delivery preference from checkout note. */
export function MerchantQuietLine({ note }: { note?: string }) {
  const quiet = parseQuietFromNote(note);
  if (!quiet) return null;
  return (
    <div className="faint" data-cta="merchant-quiet" style={{ marginTop: 4 }}>
      Zil · {quiet.label}
    </div>
  );
}
