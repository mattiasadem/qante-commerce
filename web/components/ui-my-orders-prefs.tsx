"use client";

import { parsePhotoFromNote } from "@/components/ui-photo";

/** Siparişlerim row: show checkout prefs (quiet extracted to MyOrderQuietLine). */
export function MyOrderPrefLines({ note }: { note?: string }) {
  const photo = parsePhotoFromNote(note);
  if (!photo) return null;
  return (
    <div data-cta="my-orders-prefs" style={{ marginTop: 6 }}>
      <div className="faint" data-cta="my-orders-photo">
        Foto · {photo.label}
      </div>
    </div>
  );
}
