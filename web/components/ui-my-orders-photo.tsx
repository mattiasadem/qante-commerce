"use client";

import { parsePhotoFromNote } from "@/components/ui-photo";

/** Siparişlerim row: photo delivery preference from checkout note. */
export function MyOrderPhotoLine({ note }: { note?: string }) {
  const photo = parsePhotoFromNote(note);
  if (!photo) return null;
  return (
    <div className="faint" data-cta="my-orders-photo">
      Foto · {photo.label}
    </div>
  );
}
