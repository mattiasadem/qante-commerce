"use client";

import { parseRecipientFromNote } from "@/components/ui-recipient";

/** Merchant Siparişler row: highlight alternate recipient from checkout note. */
export function MerchantRecipientLine({ note }: { note?: string }) {
  const alici = parseRecipientFromNote(note);
  if (!alici) return null;
  return (
    <div className="faint" data-cta="merchant-recipient" style={{ marginTop: 4 }}>
      Alıcı · {alici.label}
    </div>
  );
}
