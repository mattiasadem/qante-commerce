"use client";

import { parseKomsuFromNote } from "@/components/ui-komsu";

/** Merchant Siparişler row: highlight neighbor-delivery preference from checkout note. */
export function MerchantKomsuLine({ note }: { note?: string }) {
  const komsu = parseKomsuFromNote(note);
  if (!komsu) return null;
  return (
    <div className="faint" data-cta="merchant-komsu" style={{ marginTop: 4 }}>
      Komşu · {komsu.label}
    </div>
  );
}
