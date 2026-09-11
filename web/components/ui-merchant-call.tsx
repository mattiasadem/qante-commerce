"use client";

import { parseCallFromNote } from "@/components/ui-call";

/** Merchant Siparişler row: highlight pre-delivery call preference from checkout note. */
export function MerchantCallLine({ note }: { note?: string }) {
  const call = parseCallFromNote(note);
  if (!call) return null;
  return (
    <div className="faint" data-cta="merchant-call" style={{ marginTop: 4 }}>
      Ara · {call.label}
    </div>
  );
}
