"use client";

import { parseNotifyFromNote } from "@/components/ui-notify";

/** Merchant Siparişler row: highlight delivery notify preference from checkout note. */
export function MerchantNotifyLine({ note }: { note?: string }) {
  const notify = parseNotifyFromNote(note);
  if (!notify) return null;
  return (
    <div className="faint" data-cta="merchant-notify" style={{ marginTop: 4 }}>
      Bildirim · {notify.label}
    </div>
  );
}
