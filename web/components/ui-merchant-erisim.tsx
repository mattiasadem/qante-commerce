"use client";

import { parseErisimFromNote } from "@/components/ui-erisim";

/** Merchant Siparişler row: highlight building-access preference from checkout note. */
export function MerchantErisimLine({ note }: { note?: string }) {
  const erisim = parseErisimFromNote(note);
  if (!erisim) return null;
  return (
    <div className="faint" data-cta="merchant-erisim" style={{ marginTop: 4 }}>
      Erişim · {erisim.label}
    </div>
  );
}
