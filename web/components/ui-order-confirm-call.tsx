"use client";

import { parseCallFromNote } from "@/components/ui-call";

/** /siparis confirm: pre-delivery call preference from checkout note. */
export function OrderConfirmCallSummary({ note }: { note?: string }) {
  const call = parseCallFromNote(note);
  if (!call) return null;
  return (
    <p className="muted" data-cta="call-summary" style={{ marginTop: 6 }}>
      Ara · {call.label}
    </p>
  );
}
