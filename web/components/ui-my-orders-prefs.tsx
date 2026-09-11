"use client";

import { parseMontajFromNote } from "@/components/ui-montaj";
import { parseGiftFromNote } from "@/components/ui-gift";
import { parseAmbalajFromNote } from "@/components/ui-ambalaj";
import { parseEcoFromNote } from "@/components/ui-eco";
import { parseGizliFromNote } from "@/components/ui-gizli";
import { parseImzaFromNote } from "@/components/ui-imza";
import { parseFragileFromNote } from "@/components/ui-fragile";
import { parseDoormanFromNote } from "@/components/ui-doorman";
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
import { parseRecipientFromNote } from "@/components/ui-recipient";
import { parseShipInstrFromNote } from "@/components/ui-ship-instr";

/** Siparişlerim row: show checkout prefs including delivery instruction from buyer note. */
export function MyOrderPrefLines({ note }: { note?: string }) {
  const montaj = parseMontajFromNote(note);
  const gift = parseGiftFromNote(note);
  const ambalaj = parseAmbalajFromNote(note);
  const eco = parseEcoFromNote(note);
  const gizli = parseGizliFromNote(note);
  const imza = parseImzaFromNote(note);
  const fragile = parseFragileFromNote(note);
  const doorman = parseDoormanFromNote(note);
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
  const alici = parseRecipientFromNote(note);
  const talimat = parseShipInstrFromNote(note);
  if (!montaj && !gift && !ambalaj && !eco && !gizli && !imza && !fragile && !doorman && !insurance && !komsu && !paketmatik && !erisim && !warranty && !destek && !notify && !quiet && !photo && !call && !ret && !alici && !talimat) return null;
  return (
    <div data-cta="my-orders-prefs" style={{ marginTop: 6 }}>
      {montaj ? (
        <div className="faint" data-cta="my-orders-montaj">
          Montaj · {montaj.label}
        </div>
      ) : null}
      {gift ? (
        <div className="faint" data-cta="my-orders-gift">
          {gift.note ? `Hediye paketi · ${gift.note}` : "Hediye paketi"}
        </div>
      ) : null}
      {ambalaj ? (
        <div className="faint" data-cta="my-orders-ambalaj">
          Ambalaj · {ambalaj.label}
        </div>
      ) : null}
      {eco ? (
        <div className="faint" data-cta="my-orders-eco">
          Eko · {eco.label}
        </div>
      ) : null}
      {gizli ? (
        <div className="faint" data-cta="my-orders-gizli">
          Gizlilik · {gizli.label}
        </div>
      ) : null}
      {imza ? (
        <div className="faint" data-cta="my-orders-imza">
          İmza · {imza.label}
        </div>
      ) : null}
      {fragile ? (
        <div className="faint" data-cta="my-orders-fragile">
          Kırılgan · {fragile.label}
        </div>
      ) : null}
      {doorman ? (
        <div className="faint" data-cta="my-orders-doorman">
          Kapıcı · {doorman.note || "Kapıcıya bırak"}
        </div>
      ) : null}
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
      {alici ? (
        <div className="faint" data-cta="my-orders-recipient">
          Alıcı · {alici.label}
        </div>
      ) : null}
      {talimat ? (
        <div className="faint" data-cta="my-orders-talimat">
          Talimat · {talimat.label}
        </div>
      ) : null}
    </div>
  );
}
