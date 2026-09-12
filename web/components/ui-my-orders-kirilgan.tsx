"use client";

import { parseFragileFromNote } from "@/components/ui-fragile";

/** Siparişlerim row: fragile packing preference from checkout note. */
export function MyOrderKirilganLine({ note }: { note?: string }) {
  const fragile = parseFragileFromNote(note);
  if (!fragile) return null;
  return (
    <div className="faint" data-cta="my-orders-fragile">
      Kırılgan · {fragile.label}
    </div>
  );
}
