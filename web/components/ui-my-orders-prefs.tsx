"use client";

import { parseNotifyFromNote } from "@/components/ui-notify";
import { parseQuietFromNote } from "@/components/ui-quiet";
import { parsePhotoFromNote } from "@/components/ui-photo";
import { parseCallFromNote } from "@/components/ui-call";

/** Siparişlerim row: show checkout prefs (iade extracted to MyOrderIadeLine). */
export function MyOrderPrefLines({ note }: { note?: string }) {
  const notify = parseNotifyFromNote(note);
  const quiet = parseQuietFromNote(note);
  const photo = parsePhotoFromNote(note);
  const call = parseCallFromNote(note);
  if (!notify && !quiet && !photo && !call) return null;
  return (
    <div data-cta="my-orders-prefs" style={{ marginTop: 6 }}>
      {notify ? (
        <div className="faint" data-cta="my-orders-notify">
          Bildirim · {notify.label}
        </div>
      ) : null}
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
      {call ? (
        <div className="faint" data-cta="my-orders-call">
          Ara · {call.label}
        </div>
      ) : null}
    </div>
  );
}
