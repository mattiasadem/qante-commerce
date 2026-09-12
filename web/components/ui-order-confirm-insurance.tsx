"use client";

import { parseInsuranceFromNote } from "@/components/ui-insurance";

/** /siparis confirm: cargo insurance preference from checkout note. */
export function OrderConfirmInsuranceSummary({ note }: { note?: string }) {
  const ins = parseInsuranceFromNote(note);
  if (!ins) return null;
  return (
    <p className="muted" data-cta="insurance-summary" style={{ marginTop: 6 }}>
      Kargo sigortası · {ins.label}
    </p>
  );
}
