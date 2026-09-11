"use client";

import { parseReturnFromNote } from "@/components/ui-return";

/** Merchant Siparişler row: highlight easy-return window from checkout note. */
export function MerchantReturnLine({ note }: { note?: string }) {
  const ret = parseReturnFromNote(note);
  if (!ret) return null;
  return (
    <div className="faint" data-cta="merchant-return" style={{ marginTop: 4 }}>
      Kolay iade · {ret.label}
    </div>
  );
}
