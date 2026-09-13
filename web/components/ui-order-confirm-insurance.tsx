"use client";

import { parseInsuranceFromNote } from "@/components/ui-insurance";
import { OrderConfirmEcoSummary } from "@/components/ui-order-confirm-eco";

/** /siparis confirm: cargo insurance preference from checkout note; also mounts eco summary. */
export function OrderConfirmInsuranceSummary({ note }: { note?: string }) {
  const ins = parseInsuranceFromNote(note);
  return (
    <>
      {ins ? (
        <p className="muted" data-cta="insurance-summary" style={{ marginTop: 6 }}>
          Kargo sigortası · {ins.label}
        </p>
      ) : null}
      <OrderConfirmEcoSummary note={note} />
    </>
  );
}
