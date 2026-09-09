"use client";
import Link from "next/link";
import { money } from "@/lib/core";
import { useCart } from "@/components/ui-shell-providers";
import { ShopFooter } from "@/components/ui-shell-chrome";
import {
  PayButton,
  EmptyBag,
  LineList,
  SaveAllForLaterButton,
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
  ShipCarrierField,
  TaksitField,
  ShipModeField,
  ShipSpeedField,
  TipField,
  EcoField,
  RecipientField,
  DoormanField,
  InsuranceField,
  NotifyField,
  QuietField,
  CallField,
  ReturnField,
  PhotoField,
  FragileField,
  MontajField,
  WarrantyField,
  DestekField,
  AmbalajField,
  ImzaField,
  PaketmatikField,
  ErisimField,
  KomsuField,
  GizliField,
  useShipMode,
  CouponField,
  OrderNoteField,
  ShipBar,
  CheckoutNote,
  ClearCartButton,
} from "@/components/ui-cart-slot-pay";

export function CartPageView() {
  const { cart } = useCart();
  const { coupon } = useCoupon();
  const shipMode = useShipMode();
  const freeShip = isFreeShip(cart.subtotal, coupon) || shipMode.mode === "gelal";
  return (
    <div className="grid-wrap" style={{ maxWidth: 720 }}>
      <h1>Sepet</h1>
      {cart.items.length === 0 ? (
        <div className="empty">
          <div className="mark" />
          <h3>Sepet henüz boş</h3>
          <p>Keten, yün veya ev. Gridden bir parça ekle.</p>
          <p style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <Link className="btn" href="/">Mağazaya bak</Link>
            <Link className="btn" href="/?feat=1" data-cta="empty-to-feat">Öne çıkana bak</Link>
            <Link className="btn" href="/?fav=1" data-cta="empty-to-favorites">Favorilere bak</Link>
            <Link className="btn" href="/?recent=1" data-cta="empty-to-recent">Son bakılanlara bak</Link>
            <Link className="btn" href="/?watch=1" data-cta="empty-to-watch">Beklediklerime bak</Link>
            <Link className="btn" href="/?cmp=1" data-cta="empty-to-compare">Karşılaştırılanlara bak</Link>
            <Link className="btn" href="/?sale=1" data-cta="empty-to-sale">İndirimlilere bak</Link>
            <Link className="btn" href="/?low=1" data-cta="empty-to-low">Az stoka bak</Link>
          </p>
        </div>
      ) : (
        <>
          <LineList extra />
          <ShipBar subtotal={cart.subtotal} freeShip={freeShip} />
          <p>Ara toplam <strong>{money(cart.subtotal)}</strong></p>
          <CouponTotals subtotal={cart.subtotal} />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            <SaveAllForLaterButton />
            <ClearCartButton />
          </div>
          <DeliveryField />
          <ShipModeField />
          <ShipSpeedField />
          <TipField />
          <EcoField />
          <RecipientField />
          <DoormanField />
          <InsuranceField />
          <NotifyField />
          <QuietField />
          <CallField />
          <ReturnField />
          <PhotoField />
          <FragileField />
          <MontajField />
          <WarrantyField />
          <DestekField />
          <AmbalajField />
          <ImzaField />
          <PaketmatikField />
          <ErisimField />
          <KomsuField />
          <GizliField />
          <ShipInstrField />
          <GiftField />
          <PaymentField />
          <TaksitField />
          <ShipSlotField />
          <ShipDayField />
          <ShipCarrierField />
          <InvoiceField />
          <ContactField />
          <CouponField />
          <OrderNoteField />
          <PayButton />
          <CheckoutNote />
        </>
      )}
      <ShopFooter />
    </div>
  );
}
