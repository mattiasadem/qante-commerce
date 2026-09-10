"use client";

import { parseTipFromNote } from "@/components/ui-tip";

/** Merchant Siparişler row: highlight courier tip from checkout note. */
export function MerchantTipLine({ note }: { note?: string }) {
  const t = parseTipFromNote(note);
  if (!t) return null;
  return (
    <div className="faint" data-cta="merchant-tip" style={{ marginTop: 4 }}>
      Bahşiş · {t.label}
    </div>
  );
}
