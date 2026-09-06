"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { parseNotifyFromNote } from "@/components/ui-notify";

/** Shows Teslimat bildirimi · … from order note on /siparis. */
export function NotifySummaryBanner() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const q = id ? `/api/order?id=${encodeURIComponent(id)}` : "/api/order";
    void fetch(q, { cache: "no-store" }).then(async (r) => {
      if (!r.ok) return;
      const order = (await r.json()) as { note?: string };
      const p = parseNotifyFromNote(order.note);
      setLabel(p?.label ?? null);
    });
  }, [id]);

  if (!label) return null;
  return (
    <p className="muted" data-cta="notify-summary" style={{ marginTop: 6, marginBottom: 0 }}>
      Teslimat bildirimi · {label}
    </p>
  );
}
