"use client";

import { parseInsuranceFromNote } from "@/components/ui-insurance";

/** Siparişlerim row: cargo insurance preference from checkout note. */
export function MyOrderSigortaLine({ note }: { note?: string }) {
  const insurance = parseInsuranceFromNote(note);
  if (!insurance) return null;
  return (
    <div className="faint" data-cta="my-orders-insurance">
      Sigorta · {insurance.label}
    </div>
  );
}
