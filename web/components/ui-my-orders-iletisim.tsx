"use client";

import { parseContactFromNote } from "@/components/ui-contact";

/** Siparişlerim row: contact preference from checkout note. */
export function MyOrderIletisimLine({ note }: { note?: string }) {
  const iletisim = parseContactFromNote(note);
  if (!iletisim) return null;
  return (
    <div className="faint" data-cta="my-orders-iletisim">
      İletişim · {iletisim.label}
    </div>
  );
}
