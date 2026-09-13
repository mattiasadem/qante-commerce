"use client";

import { parseDoormanFromNote } from "@/components/ui-doorman";

/** /siparis confirm: leave-with-doorman preference from checkout note. */
export function OrderConfirmDoormanSummary({ note }: { note?: string }) {
  const door = parseDoormanFromNote(note);
  if (!door) return null;
  return (
    <p className="muted" data-cta="doorman-summary" style={{ marginTop: 6 }}>
      {door.label}
    </p>
  );
}
