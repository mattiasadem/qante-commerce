"use client";

import { parseImzaFromNote } from "@/components/ui-imza";

/** Merchant Siparişler row: highlight signature delivery preference from checkout note. */
export function MerchantImzaLine({ note }: { note?: string }) {
  const imza = parseImzaFromNote(note);
  if (!imza) return null;
  return (
    <div className="faint" data-cta="merchant-imza" style={{ marginTop: 4 }}>
      İmza · {imza.label}
    </div>
  );
}
