"use client";

import { parseInsuranceFromNote } from "@/components/ui-insurance";
import { parseKomsuFromNote } from "@/components/ui-komsu";
import { parsePaketmatikFromNote } from "@/components/ui-paketmatik";
import { parseErisimFromNote } from "@/components/ui-erisim";
import { parseWarrantyFromNote } from "@/components/ui-warranty";
import { parseDestekFromNote } from "@/components/ui-destek";
import { parseNotifyFromNote } from "@/components/ui-notify";
import { parseQuietFromNote } from "@/components/ui-quiet";
import { parsePhotoFromNote } from "@/components/ui-photo";
import { parseCallFromNote } from "@/components/ui-call";
import { parseReturnFromNote } from "@/components/ui-return";

/** Siparişlerim row: show checkout prefs (kapici extracted to MyOrderKapiciLine). */
export function MyOrderPrefLines({ note }: { note?: string }) {
  const insurance = parseInsuranceFromNote(note);
  const komsu = parseKomsuFromNote(note);
  const paketmatik = parsePaketmatikFromNote(note);
  const erisim = parseErisimFromNote(note);
  const warranty = parseWarrantyFromNote(note);
  const destek = parseDestekFromNote(note);
  const notify = parseNotifyFromNote(note);
  const quiet = parseQuietFromNote(note);
  const photo = parsePhotoFromNote(note);
  const call = parseCallFromNote(note);
  const ret = parseReturnFromNote(note);
  if (!insurance && !komsu && !paketmatik && !erisim && !warranty && !destek && !notify && !quiet && !photo && !call && !ret) return null;
  return (
    <div data-cta="my-orders-prefs" style={{ marginTop: 6 }}>
      {insurance ? (
        <div className="faint" data-cta="my-orders-insurance">
          Sigorta · {insurance.label}
        </div>
      ) : null}
      {komsu ? (
        <div className="faint" data-cta="my-orders-komsu">
          Komşu · {komsu.label}
        </div>
      ) : null}
      {paketmatik ? (
        <div className="faint" data-cta="my-orders-paketmatik">
          Paketmatik · {paketmatik.label}
        </div>
      ) : null}
      {erisim ? (
        <div className="faint" data-cta="my-orders-erisim">
          Erişim · {erisim.label}
        </div>
      ) : null}
      {warranty ? (
        <div className="faint" data-cta="my-orders-warranty">
          Garanti · {warranty.label}
        </div>
      ) : null}
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
