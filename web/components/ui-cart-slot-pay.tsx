"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { money } from "@/lib/core";
import { useAsk, useCart } from "@/components/ui-shell-providers";
import { OrderNoteField, readCheckoutNote } from "@/components/ui-order-note";
import {
  CouponField,
  CouponTotals,
  calcDiscount,
  isFreeShip,
  payableTotal,
  readCoupon,
  useCoupon,
} from "@/components/ui-coupon";
import { DeliveryField, formatDeliveryTag } from "@/components/ui-delivery";
import { GiftField, formatGiftTag } from "@/components/ui-gift";
import { PaymentField, formatPaymentTag } from "@/components/ui-payment";
import { ShipSlotField, formatShipSlotTag } from "@/components/ui-ship-slot";
import { InvoiceField, formatInvoiceTag } from "@/components/ui-invoice";
import { ContactField, formatContactTag } from "@/components/ui-contact";
import { ShipInstrField, formatShipInstrTag } from "@/components/ui-ship-instr";
import { ShipDayField, formatShipDayTag } from "@/components/ui-ship-day";
import { clearAllVariants, formatVariantsTag } from "@/components/ui-variant";
import {
  ShipBar,
  CheckoutNote,
  ClearCartButton,
} from "@/components/ui-shell-chrome";
import { LineList, SaveAllForLaterButton } from "@/components/ui-shell-line";

export function useFavCount() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const sync = () => {
      try {
        const raw = JSON.parse(localStorage.getItem("qante_favorites") || "[]") as unknown;
        setN(Array.isArray(raw) ? raw.filter((x) => typeof x === "string").length : 0);
      } catch {
        setN(0);
      }
    };
    sync();
    window.addEventListener("qante-favorites", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("qante-favorites", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return n;
}

export function EmptyBag({ onClose }: { onClose?: () => void }) {
  return (
    <div className="empty">
      <div className="mark" aria-hidden="true" />
      <h3>Sepet henüz boş</h3>
      <p>Keten, yün veya ev. Gridden bir parça ekle.</p>
      <Link className="btn" href="/?fav=1" data-cta="empty-to-favorites" onClick={() => onClose?.()} style={{ marginTop: 14, display: "inline-block" }}>
        Favorilere bak
      </Link>
    </div>
  );
}

/** PayButton with [odeme:…] + [saat:…] + [gun:…] + [fatura:…] + [iletisim:…] + [talimat:…] note tags. */
export function PayButton() {
  const { cart, checkout } = useCart();
  const { setCartOpen } = useAsk();
  const { coupon } = useCoupon();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (cart.items.length === 0) return null;
  const pay = payableTotal(cart.subtotal, coupon);
  const discount = calcDiscount(cart.subtotal, coupon);
  const labelPay = discount > 0 ? money(pay) : null;
  return (
    <button className="btn btn-primary" type="button" style={{ width: "100%" }} disabled={busy} onClick={async () => {
      setBusy(true);
      let note = readCheckoutNote();
      const c = readCoupon();
      if (c) {
        const tag = `[kupon:${c.code}]`;
        note = note ? `${note} ${tag}` : tag;
      }
      const del = formatDeliveryTag();
      if (del) note = note ? `${note} ${del}` : del;
      const gift = formatGiftTag();
      if (gift) note = note ? `${note} ${gift}` : gift;
      const payTag = formatPaymentTag();
      if (payTag) note = note ? `${note} ${payTag}` : payTag;
      const saat = formatShipSlotTag();
      if (saat) note = note ? `${note} ${saat}` : saat;
      const fatura = formatInvoiceTag();
      if (fatura) note = note ? `${note} ${fatura}` : fatura;
      const iletisim = formatContactTag();
      if (iletisim) note = note ? `${note} ${iletisim}` : iletisim;
      const talimat = formatShipInstrTag();
      if (talimat) note = note ? `${note} ${talimat}` : talimat;
      const gun = formatShipDayTag();
      if (gun) note = note ? `${note} ${gun}` : gun;
      const vtag = formatVariantsTag(cart.items.map((l) => l.product_id));
      if (vtag) note = note ? `${note} ${vtag}` : vtag;
      const order = await checkout(note);
      setBusy(false);
      if (!order) return;
      clearAllVariants();
      setCartOpen(false);
      router.push(`/siparis?id=${encodeURIComponent(order.order_id)}`);
    }}>{busy ? "yazılıyor" : labelPay ? `Ödemeye geç · ${labelPay}` : "Ödemeye geç"}</button>
  );
}

export {
  money,
  useAsk,
  useCart,
  LineList,
  SaveAllForLaterButton,
  OrderNoteField,
  CouponField,
  CouponTotals,
  isFreeShip,
  useCoupon,
  DeliveryField,
  GiftField,
  PaymentField,
  ShipSlotField,
  InvoiceField,
  ContactField,
  ShipInstrField,
  ShipDayField,
  ShipBar,
  CheckoutNote,
  ClearCartButton,
};
