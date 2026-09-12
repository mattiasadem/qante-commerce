"use client";

import { parseDestekFromNote } from "@/components/ui-destek";
import { parseNotifyFromNote } from "@/components/ui-notify";
import { parseQuietFromNote } from "@/components/ui-quiet";
import { parsePhotoFromNote } from "@/components/ui-photo";
import { parseCallFromNote } from "@/components/ui-call";
import { parseReturnFromNote } from "@/components/ui-return";

/** Siparişlerim row: show checkout prefs (garanti extracted to MyOrderGarantiLine). */
export function MyOrderPrefLines({ note }: { note?: string }) {
  const destek = parseDestekFromNote(note);
  const notify = parseNotifyFromNote(note);
  const quiet = parseQuietFromNote(note);
  const photo = parsePhotoFromNote(note);
  const call = parseCallFromNote(note);
  const ret = parseReturnFromNote(note);
  if (!destek && !notify && !quiet && !photo && !call && !ret) return null;
  return (
    <div data-cta="my-orders-prefs" style={{ marginTop: 6 }}>
      {destek ? (
        <div className="faint" data-cta="my-orders-destek">
          Destek · {destek.label}
        </div>
      ) : null}
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
      {ret ? (
        <div className="faint" data-cta="my-orders-return">
          Kolay iade · {ret.label}
        </div>
      ) : null}
    </div>
  );
}
