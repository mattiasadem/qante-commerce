"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { parseWarrantyFromNote } from "@/components/ui-warranty";

/** Shows Garanti uzatma · … from order note on /siparis. */
export function WarrantySummaryBanner() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const q = id ? `/api/order?id=${encodeURIComponent(id)}` : "/api/order";
    void fetch(q, { cache: "no-store" }).then(async (r) => {
      if (!r.ok) return;
      const order = (await r.json()) as { note?: string };
      const p = parseWarrantyFromNote(order.note);
      setLabel(p?.label ?? null);
    });
  }, [id]);

  if (!label) return null;
  return (
    <p className="muted" data-cta="warranty-summary" style={{ marginTop: 6, marginBottom: 0 }}>
      Garanti uzatma · {label}
    </p>
  );
}
