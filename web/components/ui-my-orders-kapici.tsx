"use client";

import { parseDoormanFromNote } from "@/components/ui-doorman";

/** Siparişlerim row: doorman / leave-with-kapıcı preference from checkout note. */
export function MyOrderKapiciLine({ note }: { note?: string }) {
  const doorman = parseDoormanFromNote(note);
  if (!doorman) return null;
  return (
    <div className="faint" data-cta="my-orders-doorman">
      Kapıcı · {doorman.note || "Kapıcıya bırak"}
    </div>
  );
}
