"use client";

import { parseAmbalajFromNote } from "@/components/ui-ambalaj";

/** Siparişlerim row: packaging preference from checkout note. */
export function MyOrderAmbalajLine({ note }: { note?: string }) {
  const ambalaj = parseAmbalajFromNote(note);
  if (!ambalaj) return null;
  return (
    <div className="faint" data-cta="my-orders-ambalaj">
      Ambalaj · {ambalaj.label}
    </div>
  );
}
