"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { parseShipCarrierFromNote } from "@/components/ui-ship-carrier";

/** Shows Kargo firması · … from order note on /siparis. */
export function ShipCarrierSummaryBanner() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const q = id ? `/api/order?id=${encodeURIComponent(id)}` : "/api/order";
    void fetch(q, { cache: "no-store" }).then(async (r) => {
      if (!r.ok) return;
      const order = (await r.json()) as { note?: string };
      const p = parseShipCarrierFromNote(order.note);
      setLabel(p?.label ?? null);
    });
  }, [id]);

  if (!label) return null;
  return (
    <p className="muted" data-cta="ship-carrier-summary" style={{ marginTop: 6, marginBottom: 0 }}>
      Kargo firması · {label}
    </p>
  );
}
