"use client";

import { parsePaketmatikFromNote } from "@/components/ui-paketmatik";

/** Merchant Siparişler row: highlight paketmatik pickup preference from checkout note. */
export function MerchantPaketmatikLine({ note }: { note?: string }) {
  const paketmatik = parsePaketmatikFromNote(note);
  if (!paketmatik) return null;
  return (
    <div className="faint" data-cta="merchant-paketmatik" style={{ marginTop: 4 }}>
      Paketmatik · {paketmatik.label}
    </div>
  );
}
