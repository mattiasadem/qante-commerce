"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { money } from "@/lib/core";
import { useAsk, useCart } from "@/components/ui-shell-providers";
import { LineList, SaveAllForLaterButton } from "@/components/ui-shell-line";
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
import { CompareTray } from "@/components/ui-compare";
import { clearAllVariants, formatVariantsTag } from "@/components/ui-variant";
import {
  Logo,
  ShipBar,
  CheckoutNote,
  ClearCartButton,
  ShopFooter,
} from "@/components/ui-shell-chrome";

const FAV_KEY = "qante_favorites";
function useFavCount() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const sync = () => {
      try {
        const raw = JSON.parse(localStorage.getItem(FAV_KEY) || "[]") as unknown;
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

function EmptyBag({ onClose }: { onClose?: () => void }) {
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

/** PayButton with [odeme:…] note tag. */
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

export function CartDrawer() {
  const { cart } = useCart();
  const { cartOpen, setCartOpen } = useAsk();
  const { coupon } = useCoupon();
  const freeShip = isFreeShip(cart.subtotal, coupon);
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
          <GiftField />
          <PaymentField />
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

/** /sepet page with Ödeme yöntemi chips. */
export function CartPageView() {
  const { cart } = useCart();
  const { coupon } = useCoupon();
  const freeShip = isFreeShip(cart.subtotal, coupon);
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
          <GiftField />
          <PaymentField />
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
