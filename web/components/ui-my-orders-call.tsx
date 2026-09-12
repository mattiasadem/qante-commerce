"use client";

import { parseCallFromNote } from "@/components/ui-call";

/** Siparişlerim row: pre-delivery call preference from checkout note. */
export function MyOrderCallLine({ note }: { note?: string }) {
  const call = parseCallFromNote(note);
  if (!call) return null;
  return (
    <div className="faint" data-cta="my-orders-call">
      Ara · {call.label}
    </div>
  );
}
