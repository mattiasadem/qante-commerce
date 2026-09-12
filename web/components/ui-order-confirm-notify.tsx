"use client";

import { parseNotifyFromNote } from "@/components/ui-notify";

/** /siparis confirm: delivery notification preference from checkout note. */
export function OrderConfirmNotifySummary({ note }: { note?: string }) {
  const notify = parseNotifyFromNote(note);
  if (!notify) return null;
  return (
    <p className="muted" data-cta="notify-summary" style={{ marginTop: 6 }}>
      Bildirim · {notify.label}
    </p>
  );
}
