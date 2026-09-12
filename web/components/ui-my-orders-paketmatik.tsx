"use client";

import { parsePaketmatikFromNote } from "@/components/ui-paketmatik";

/** Siparişlerim row: Paketmatik locker preference from checkout note. */
export function MyOrderPaketmatikLine({ note }: { note?: string }) {
  const paketmatik = parsePaketmatikFromNote(note);
  if (!paketmatik) return null;
  return (
    <div className="faint" data-cta="my-orders-paketmatik">
      Paketmatik · {paketmatik.label}
    </div>
  );
}
