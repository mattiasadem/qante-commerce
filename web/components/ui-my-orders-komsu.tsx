"use client";

import { parseKomsuFromNote } from "@/components/ui-komsu";

/** Siparişlerim row: neighbor delivery preference from checkout note. */
export function MyOrderKomsuLine({ note }: { note?: string }) {
  const komsu = parseKomsuFromNote(note);
  if (!komsu) return null;
  return (
    <div className="faint" data-cta="my-orders-komsu">
      Komşu · {komsu.label}
    </div>
  );
}
