"use client";

import { parsePhotoFromNote } from "@/components/ui-photo";

/** /siparis confirm: photo-proof delivery preference from checkout note. */
export function OrderConfirmPhotoSummary({ note }: { note?: string }) {
  const photo = parsePhotoFromNote(note);
  if (!photo) return null;
  return (
    <p className="muted" data-cta="photo-summary" style={{ marginTop: 6 }}>
      Foto · {photo.label}
    </p>
  );
}
