"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { parseErisimFromNote } from "@/components/ui-erisim";

/** Shows Erişim · … from order note on /siparis. */
export function ErisimSummaryBanner() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const q = id ? `/api/order?id=${encodeURIComponent(id)}` : "/api/order";
    void fetch(q, { cache: "no-store" }).then(async (r) => {
      if (!r.ok) return;
      const order = (await r.json()) as { note?: string };
      const p = parseErisimFromNote(order.note);
      setLabel(p?.label ?? null);
    });
  }, [id]);

  if (!label) return null;
  return (
    <p className="muted" data-cta="erisim-summary" style={{ marginTop: 6, marginBottom: 0 }}>
      Erişim · {label}
    </p>
  );
}
