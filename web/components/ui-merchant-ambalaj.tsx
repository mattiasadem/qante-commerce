"use client";

import { parseAmbalajFromNote } from "@/components/ui-ambalaj";

/** Merchant Siparişler row: highlight packaging preference from checkout note. */
export function MerchantAmbalajLine({ note }: { note?: string }) {
  const a = parseAmbalajFromNote(note);
  if (!a) return null;
  return (
    <div className="faint" data-cta="merchant-ambalaj" style={{ marginTop: 4 }}>
      Ambalaj · {a.label}
    </div>
  );
}
