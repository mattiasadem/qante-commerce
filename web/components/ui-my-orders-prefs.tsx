"use client";

import { parseQuietFromNote } from "@/components/ui-quiet";
import { parsePhotoFromNote } from "@/components/ui-photo";

/** Siparişlerim row: show checkout prefs (notify extracted to MyOrderNotifyLine). */
export function MyOrderPrefLines({ note }: { note?: string }) {
  const quiet = parseQuietFromNote(note);
  const photo = parsePhotoFromNote(note);
  if (!quiet && !photo) return null;
  return (
    <div data-cta="my-orders-prefs" style={{ marginTop: 6 }}>
      {quiet ? (
        <div className="faint" data-cta="my-orders-quiet">
          Zil · {quiet.label}
        </div>
      ) : null}
      {photo ? (
        <div className="faint" data-cta="my-orders-photo">
          Foto · {photo.label}
        </div>
      ) : null}
    </div>
  );
}
