"use client";

import { parseInsuranceFromNote } from "@/components/ui-insurance";

/** Merchant Siparişler row: highlight cargo insurance preference from checkout note. */
export function MerchantInsuranceLine({ note }: { note?: string }) {
  const insurance = parseInsuranceFromNote(note);
  if (!insurance) return null;
  return (
    <div className="faint" data-cta="merchant-insurance" style={{ marginTop: 4 }}>
      Sigorta · {insurance.label}
    </div>
  );
}
