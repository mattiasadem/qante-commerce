"use client";

import { parseDeliveryFromNote } from "@/components/ui-delivery";

/** /siparis confirm: delivery contact from checkout note. */
export function OrderConfirmDeliverySummary({ note }: { note?: string }) {
  const d = parseDeliveryFromNote(note);
  if (!d) return null;
  const line = [d.name, d.phone, d.city, d.address].filter(Boolean).join(" · ");
  if (!line) return null;
  return (
    <p className="muted" data-cta="delivery-summary" style={{ marginTop: 6 }}>
      Teslimat · {line}
    </p>
  );
}
