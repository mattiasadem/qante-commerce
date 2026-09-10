"use client";

import { parseDoormanFromNote } from "@/components/ui-doorman";

/** Merchant Siparişler row: highlight leave-with-doorman preference from checkout note. */
export function MerchantDoormanLine({ note }: { note?: string }) {
  const doorman = parseDoormanFromNote(note);
  if (!doorman) return null;
  return (
    <div className="faint" data-cta="merchant-doorman" style={{ marginTop: 4 }}>
      Kapıcı · {doorman.note || "Kapıcıya bırak"}
    </div>
  );
}
