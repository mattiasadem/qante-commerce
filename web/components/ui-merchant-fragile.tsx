"use client";

import { parseFragileFromNote } from "@/components/ui-fragile";

/** Merchant Siparişler row: highlight fragile packing preference from checkout note. */
export function MerchantFragileLine({ note }: { note?: string }) {
  const fragile = parseFragileFromNote(note);
  if (!fragile) return null;
  return (
    <div className="faint" data-cta="merchant-fragile" style={{ marginTop: 4 }}>
      Kırılgan · {fragile.label}
    </div>
  );
}
