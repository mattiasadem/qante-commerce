"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { parseGiftFromNote } from "@/components/ui-gift";

/** Shows Hediye paketi · … from order note on /siparis. */
export function GiftSummaryBanner() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const q = id ? `/api/order?id=${encodeURIComponent(id)}` : "/api/order";
    void fetch(q, { cache: "no-store" }).then(async (r) => {
      if (!r.ok) return;
      const order = (await r.json()) as { note?: string };
      const p = parseGiftFromNote(order.note);
      if (!p) {
        setLabel(null);
        return;
      }
      setLabel(p.note ? `Hediye paketi · ${p.note}` : "Hediye paketi");
    });
  }, [id]);

  if (!label) return null;
  return (
    <p className="muted" data-cta="gift-summary" style={{ marginTop: 6, marginBottom: 0 }}>
      {label}
    </p>
  );
}
