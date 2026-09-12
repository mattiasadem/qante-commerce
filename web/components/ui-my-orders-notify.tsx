"use client";

import { parseNotifyFromNote } from "@/components/ui-notify";

/** Siparişlerim row: delivery notification preference from checkout note. */
export function MyOrderNotifyLine({ note }: { note?: string }) {
  const notify = parseNotifyFromNote(note);
  if (!notify) return null;
  return (
    <div className="faint" data-cta="my-orders-notify">
      Bildirim · {notify.label}
    </div>
  );
}
