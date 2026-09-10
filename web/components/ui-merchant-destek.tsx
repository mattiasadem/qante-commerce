"use client";

import { parseDestekFromNote } from "@/components/ui-destek";

/** Merchant Siparişler row: highlight priority support preference from checkout note. */
export function MerchantDestekLine({ note }: { note?: string }) {
  const destek = parseDestekFromNote(note);
  if (!destek) return null;
  return (
    <div className="faint" data-cta="merchant-destek" style={{ marginTop: 4 }}>
      Destek · {destek.label}
    </div>
  );
}
