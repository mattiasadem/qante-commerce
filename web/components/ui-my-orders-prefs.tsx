"use client";

import { parseCouponFromNote } from "@/components/ui-coupon-parse";
import { parseShipSlotFromNote } from "@/components/ui-ship-slot";
import { parseTaksitFromNote } from "@/components/ui-taksit";
import { parseTipFromNote } from "@/components/ui-tip";
import { parseMontajFromNote } from "@/components/ui-montaj";
import { parseGiftFromNote } from "@/components/ui-gift";
import { parseInvoiceFromNote } from "@/components/ui-invoice";
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

/** Siparişlerim row: show checkout coupon / slot / taksit / tip / montaj / hediye / fatura / ambalaj / eko / gizlilik / imza / kırılgan / kapıcı / sigorta / komşu / paketmatik / erişim from buyer note. */
export function MyOrderPrefLines({ note }: { note?: string }) {
  const coupon = parseCouponFromNote(note);
  const slot = parseShipSlotFromNote(note);
  const taksit = parseTaksitFromNote(note);
  const tip = parseTipFromNote(note);
  const montaj = parseMontajFromNote(note);
  const gift = parseGiftFromNote(note);
  const invoice = parseInvoiceFromNote(note);
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
  if (!coupon && !slot && !taksit && !tip && !montaj && !gift && !invoice && !ambalaj && !eco && !gizli && !imza && !fragile && !doorman && !insurance && !komsu && !paketmatik && !erisim) return null;
  return (
    <div data-cta="my-orders-prefs" style={{ marginTop: 6 }}>
      {coupon ? (
        <div className="faint" data-cta="my-orders-coupon">
          Kupon · {coupon.label}
        </div>
      ) : null}
      {slot ? (
        <div className="faint" data-cta="my-orders-slot">
          Teslimat saati · {slot.label}
        </div>
      ) : null}
      {taksit ? (
        <div className="faint" data-cta="my-orders-taksit">
          Taksit · {taksit.label}
        </div>
      ) : null}
      {tip ? (
        <div className="faint" data-cta="my-orders-tip">
          Bahşiş · {tip.label}
        </div>
      ) : null}
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
      {invoice ? (
        <div className="faint" data-cta="my-orders-invoice">
          Fatura · {invoice.label}
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
    </div>
  );
}
