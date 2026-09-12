"use client";

import { parseWarrantyFromNote } from "@/components/ui-warranty";

/** Siparişlerim row: warranty extension preference from checkout note. */
export function MyOrderGarantiLine({ note }: { note?: string }) {
  const warranty = parseWarrantyFromNote(note);
  if (!warranty) return null;
  return (
    <div className="faint" data-cta="my-orders-warranty">
      Garanti · {warranty.label}
    </div>
  );
}
