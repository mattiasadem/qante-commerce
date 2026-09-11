"use client";

import { parseShipSpeedFromNote } from "@/components/ui-ship-speed";

/** Siparişlerim row: delivery speed from checkout note. */
export function MyOrderHizLine({ note }: { note?: string }) {
  const hiz = parseShipSpeedFromNote(note);
  if (!hiz) return null;
  return (
    <div className="faint" data-cta="my-orders-hiz">
      Teslimat hızı · {hiz.label}
    </div>
  );
}
