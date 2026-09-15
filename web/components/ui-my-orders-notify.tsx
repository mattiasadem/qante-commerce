"use client";

import { useState } from "react";
import { parseNotifyFromNote } from "@/components/ui-notify";

/** Siparişlerim row: delivery notification preference from checkout note with copy CTA. */
export function MyOrderNotifyLine({ note }: { note?: string }) {
  const notify = parseNotifyFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!notify) return null;

  async function copyNotify() {
    try {
      await navigator.clipboard.writeText(notify.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-notify" style={{ marginTop: 6 }}>
      Bildirim · {notify.label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-notify-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyNotify()}
      >
        {copied ? "kopyalandı" : "Bildirimi kopyala"}
      </button>
    </div>
  );
}
