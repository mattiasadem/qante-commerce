"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { money } from "@/lib/core";
import { useAsk, useCart } from "@/components/ui-shell-providers";
import { CompareTray } from "@/components/ui-compare";
import {
  Logo,
  ShopFooter,
} from "@/components/ui-shell-chrome";
import {
  PayButton,
  EmptyBag,
  useFavCount,
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
  useShipMode,
  CouponField,
  OrderNoteField,
  ShipBar,
  CheckoutNote,
  ClearCartButton,
} from "@/components/ui-cart-slot-pay";

export { PayButton } from "@/components/ui-cart-slot-pay";

export function CartDrawer() {
  const { cart } = useCart();
  const { cartOpen, setCartOpen } = useAsk();
  const { coupon } = useCoupon();
  const shipMode = useShipMode();
  const freeShip = isFreeShip(cart.subtotal, coupon) || shipMode.mode === "gelal";
  return (
    <>
      <div className="drawer-backdrop" hidden={!cartOpen} onClick={() => setCartOpen(false)} data-component="CartDrawer" />
      <aside className="drawer" hidden={!cartOpen} role="dialog" aria-label="Sepet" data-component="CartDrawer">
        <div className="drawer-head"><strong>Sepet</strong><button className="icon-btn" type="button" onClick={() => setCartOpen(false)} aria-label="Kapat">Kapat</button></div>
        <div className="drawer-body">{cart.items.length === 0 ? <EmptyBag onClose={() => setCartOpen(false)} /> : <LineList />}</div>
        <div className="drawer-foot">
          <ShipBar subtotal={cart.subtotal} freeShip={freeShip} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><span className="muted">Ara toplam</span><strong>{money(cart.subtotal)}</strong></div>
          <CouponTotals subtotal={cart.subtotal} />
          <Link className="btn" href="/sepet" onClick={() => setCartOpen(false)} style={{ display: "block", textAlign: "center", marginBottom: 8 }}>Sepete git</Link>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}><SaveAllForLaterButton className="btn" /><ClearCartButton className="btn" /></div>
          <DeliveryField />
          <ShipModeField />
          <ShipSpeedField />
          <TipField />
          <EcoField />
          <RecipientField />
          <DoormanField />
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
        </div>
      </aside>
    </>
  );
}

export function StoreShell({ children }: { children: ReactNode }) {
  const { count, badgePop } = useCart();
  const { requestAsk, setSheetOpen, setCartOpen } = useAsk();
  const [q, setQ] = useState("");
  const router = useRouter();
  const path = usePathname();
  const search = useSearchParams();
  const favCount = useFavCount();
  const favOn = path === "/" && (search.get("fav") === "1" || search.get("fav") === "true");
  return (
    <>
      <header className="header">
        <Link href="/" className="brand" aria-label="Qante"><Logo /><span>QANTE</span></Link>
        <form style={{ flex: 1, display: "flex", justifyContent: "center" }} onSubmit={(e) => {
          e.preventDefault();
          const query = q.trim();
          if (query) { requestAsk(query); router.push(`/?q=${encodeURIComponent(query)}`); }
          else router.push("/");
        }}>
          <input className="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ne arıyorsun" aria-label="Ara" />
        </form>
        <div className="header-actions">
          <Link href="/?fav=1" className={`icon-btn ${favOn ? "on" : ""}`} data-cta="nav-favorites" aria-label="Favoriler">
            Favoriler{favCount > 0 ? <span className="badge">{favCount}</span> : null}
          </Link>
          <Link href="/siparislerim" className={`icon-btn ${path.startsWith("/siparislerim") ? "on" : ""}`} data-cta="my-orders">Siparişlerim</Link>
          <Link href="/merchant" className="icon-btn">Operatör</Link>
          <button className="icon-btn" type="button" onClick={() => setCartOpen(true)} aria-label="Sepet">
            Sepet{count > 0 ? <span className={`badge ${badgePop ? "ac-pop" : ""}`}>{count}</span> : null}
          </button>
        </div>
      </header>
      <CartDrawer />
      <CompareTray />
      {children}
      <nav className="dock" aria-label="Mobil">
        <Link href="/" className={path === "/" && !favOn ? "on" : ""}>Mağaza</Link>
        <Link href="/?fav=1" className={favOn ? "on" : ""} data-cta="dock-favorites">Favori{favCount > 0 ? ` ${favCount}` : ""}</Link>
        <Link href="/siparislerim" className={path.startsWith("/siparislerim") ? "on" : ""}>Sipariş</Link>
        <button type="button" onClick={() => setSheetOpen(true)}>Asistan</button>
        <button type="button" className={path === "/sepet" ? "on" : ""} onClick={() => setCartOpen(true)}>
          Sepet{count > 0 ? ` ${count}` : ""}
        </button>
      </nav>
    </>
  );
}

export function ShopFrame({ children }: { children: ReactNode }) {
  const path = usePathname();
  if (path.startsWith("/merchant")) return <>{children}</>;
  return <StoreShell>{children}</StoreShell>;
}

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
            <Link className="btn" href="/?fav=1" data-cta="empty-to-favorites">Favorilere bak</Link>
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
