"use client";

import { useState } from "react";
import { parseDeliveryFromNote } from "@/components/ui-delivery";

/** /siparis confirm: delivery contact from checkout note with copy CTA. */
export function OrderConfirmDeliverySummary({ note }: { note?: string }) {
  const d = parseDeliveryFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!d) return null;
  const line = [d.name, d.phone, d.city, d.address].filter(Boolean).join(" · ");
  if (!line) return null;

  async function copyDelivery() {
    try {
      await navigator.clipboard.writeText(line);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <p className="muted" data-cta="delivery-summary" style={{ marginTop: 6 }}>
      Teslimat · {line}
      <button
        className="chip"
        type="button"
        data-cta="delivery-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyDelivery()}
      >
        {copied ? "kopyalandı" : "Teslimatı kopyala"}
      </button>
    </p>
  );
}
