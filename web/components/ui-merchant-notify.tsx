"use client";

import { useState } from "react";
import { parseNotifyFromNote } from "@/components/ui-notify";

/** Merchant Siparişler row: delivery notify preference from checkout note with copy CTA. */
export function MerchantNotifyLine({ note }: { note?: string }) {
  const notify = parseNotifyFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!notify) return null;

  const label = `Bildirim · ${notify.label}`;

  async function copyNotify() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-notify" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-notify-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyNotify()}
      >
        {copied ? "kopyalandı" : "Bildirimi kopyala"}
      </button>
    </div>
  );
}
