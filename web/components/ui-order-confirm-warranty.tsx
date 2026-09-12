"use client";

import { parseWarrantyFromNote } from "@/components/ui-warranty";

/** /siparis confirm: warranty extension preference from checkout note. */
export function OrderConfirmWarrantySummary({ note }: { note?: string }) {
  const warranty = parseWarrantyFromNote(note);
  if (!warranty) return null;
  return (
    <p className="muted" data-cta="warranty-summary" style={{ marginTop: 6 }}>
      Garanti · {warranty.label}
    </p>
  );
}
