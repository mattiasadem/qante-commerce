"use client";

import { parseWarrantyFromNote } from "@/components/ui-warranty";

/** Merchant Siparişler row: highlight warranty extension preference from checkout note. */
export function MerchantWarrantyLine({ note }: { note?: string }) {
  const warranty = parseWarrantyFromNote(note);
  if (!warranty) return null;
  return (
    <div className="faint" data-cta="merchant-warranty" style={{ marginTop: 4 }}>
      Garanti · {warranty.label}
    </div>
  );
}
