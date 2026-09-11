"use client";

import { parseContactFromNote } from "@/components/ui-contact";

/** Merchant Siparişler row: highlight contact preference from checkout note. */
export function MerchantIletisimLine({ note }: { note?: string }) {
  const iletisim = parseContactFromNote(note);
  if (!iletisim) return null;
  return (
    <div className="faint" data-cta="merchant-iletisim" style={{ marginTop: 4 }}>
      İletişim · {iletisim.label}
    </div>
  );
}
