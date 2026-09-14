"use client";

import { useState } from "react";
import { parseDoormanFromNote } from "@/components/ui-doorman";
import { OrderConfirmImzaSummary } from "@/components/ui-order-confirm-imza";

/** /siparis confirm: leave-with-doorman preference from checkout note with copy CTA; also mounts imza summary. */
export function OrderConfirmDoormanSummary({ note }: { note?: string }) {
  const door = parseDoormanFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copyDoorman() {
    if (!door) return;
    try {
      await navigator.clipboard.writeText(door.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {door ? (
        <p className="muted" data-cta="doorman-summary" style={{ marginTop: 6 }}>
          {door.label}
          <button
            className="chip"
            type="button"
            data-cta="doorman-copy"
            style={{ marginLeft: 10 }}
            onClick={() => void copyDoorman()}
          >
            {copied ? "kopyalandı" : "Kapıcıyı kopyala"}
          </button>
        </p>
      ) : null}
      <OrderConfirmImzaSummary note={note} />
    </>
  );
}
