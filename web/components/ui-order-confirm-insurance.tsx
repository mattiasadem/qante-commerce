"use client";

import { useState } from "react";
import { parseInsuranceFromNote } from "@/components/ui-insurance";
import { OrderConfirmEcoSummary } from "@/components/ui-order-confirm-eco";

/** /siparis confirm: cargo insurance preference from checkout note with copy CTA; also mounts eco summary. */
export function OrderConfirmInsuranceSummary({ note }: { note?: string }) {
  const ins = parseInsuranceFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copyInsurance() {
    if (!ins) return;
    try {
      await navigator.clipboard.writeText(ins.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      {ins ? (
        <p className="muted" data-cta="insurance-summary" style={{ marginTop: 6 }}>
          Kargo sigortası · {ins.label}
          <button
            className="chip"
            type="button"
            data-cta="insurance-copy"
            style={{ marginLeft: 10 }}
            onClick={() => void copyInsurance()}
          >
            {copied ? "kopyalandı" : "Sigortayı kopyala"}
          </button>
        </p>
      ) : null}
      <OrderConfirmEcoSummary note={note} />
    </>
  );
}
