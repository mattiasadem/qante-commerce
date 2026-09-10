"use client";

import { parseCouponFromNote } from "@/components/ui-coupon-parse";
import { parseShipSlotFromNote } from "@/components/ui-ship-slot";
import { parseTaksitFromNote } from "@/components/ui-taksit";
import { parseTipFromNote } from "@/components/ui-tip";
import { parseMontajFromNote } from "@/components/ui-montaj";
import { parseGiftFromNote } from "@/components/ui-gift";

/** Siparişlerim row: show checkout coupon / slot / taksit / tip / montaj / hediye from buyer note. */
export function MyOrderPrefLines({ note }: { note?: string }) {
  const coupon = parseCouponFromNote(note);
  const slot = parseShipSlotFromNote(note);
  const taksit = parseTaksitFromNote(note);
  const tip = parseTipFromNote(note);
  const montaj = parseMontajFromNote(note);
  const gift = parseGiftFromNote(note);
  if (!coupon && !slot && !taksit && !tip && !montaj && !gift) return null;
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
    </div>
  );
}
