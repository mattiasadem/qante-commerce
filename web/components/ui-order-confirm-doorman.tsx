"use client";

import { parseDoormanFromNote } from "@/components/ui-doorman";
import { OrderConfirmImzaSummary } from "@/components/ui-order-confirm-imza";

/** /siparis confirm: leave-with-doorman preference from checkout note; also mounts imza summary. */
export function OrderConfirmDoormanSummary({ note }: { note?: string }) {
  const door = parseDoormanFromNote(note);
  return (
    <>
      {door ? (
        <p className="muted" data-cta="doorman-summary" style={{ marginTop: 6 }}>
          {door.label}
        </p>
      ) : null}
      <OrderConfirmImzaSummary note={note} />
    </>
  );
}
