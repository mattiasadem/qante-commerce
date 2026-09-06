"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { parsePhotoFromNote } from "@/components/ui-photo";

/** Shows Fotoğraflı teslimat · … from order note on /siparis. */
export function PhotoSummaryBanner() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const q = id ? `/api/order?id=${encodeURIComponent(id)}` : "/api/order";
    void fetch(q, { cache: "no-store" }).then(async (r) => {
      if (!r.ok) return;
      const order = (await r.json()) as { note?: string };
      const p = parsePhotoFromNote(order.note);
      setLabel(p?.label ?? null);
    });
  }, [id]);

  if (!label) return null;
  return (
    <p className="muted" data-cta="photo-summary" style={{ marginTop: 6, marginBottom: 0 }}>
      Fotoğraflı teslimat · {label}
    </p>
  );
}
