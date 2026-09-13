"use client";

import { parseErisimFromNote } from "@/components/ui-erisim";
import { OrderConfirmDestekSummary } from "@/components/ui-order-confirm-destek";

/** /siparis confirm: building-access preference from checkout note; also mounts destek summary. */
export function OrderConfirmErisimSummary({ note }: { note?: string }) {
  const erisim = parseErisimFromNote(note);
  return (
    <>
      {erisim ? (
        <p className="muted" data-cta="erisim-summary" style={{ marginTop: 6 }}>
          Erişim · {erisim.label}
        </p>
      ) : null}
      <OrderConfirmDestekSummary note={note} />
    </>
  );
}
