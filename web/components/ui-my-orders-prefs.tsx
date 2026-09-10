"use client";

import { parseCouponFromNote } from "@/components/ui-coupon-parse";
import { parseShipSlotFromNote } from "@/components/ui-ship-slot";
import { parseTaksitFromNote } from "@/components/ui-taksit";
import { parseTipFromNote } from "@/components/ui-tip";
import { parseMontajFromNote } from "@/components/ui-montaj";
import { parseGiftFromNote } from "@/components/ui-gift";
import { parseInvoiceFromNote } from "@/components/ui-invoice";
import { parseAmbalajFromNote } from "@/components/ui-ambalaj";

/** Siparişlerim row: show checkout coupon / slot / taksit / tip / montaj / hediye / fatura / ambalaj from buyer note. */
export function MyOrderPrefLines({ note }: { note?: string }) {
  const coupon = parseCouponFromNote(note);
  const slot = parseShipSlotFromNote(note);
  const taksit = parseTaksitFromNote(note);
  const tip = parseTipFromNote(note);
  const montaj = parseMontajFromNote(note);
  const gift = parseGiftFromNote(note);
  const invoice = parseInvoiceFromNote(note);
  const ambalaj = parseAmbalajFromNote(note);
  if (!coupon && !slot && !taksit && !tip && !montaj && !gift && !invoice && !ambalaj) return null;
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
    </div>
  );
}
