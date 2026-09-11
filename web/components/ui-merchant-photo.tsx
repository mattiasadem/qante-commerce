"use client";

import { parsePhotoFromNote } from "@/components/ui-photo";

/** Merchant Siparişler row: highlight photo-proof delivery preference from checkout note. */
export function MerchantPhotoLine({ note }: { note?: string }) {
  const photo = parsePhotoFromNote(note);
  if (!photo) return null;
  return (
    <div className="faint" data-cta="merchant-photo" style={{ marginTop: 4 }}>
      Foto · {photo.label}
    </div>
  );
}
