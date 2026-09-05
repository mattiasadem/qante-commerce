"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { money, SHIP_FREE } from "@/lib/core";
import { useAsk, useCart } from "@/components/ui-shell-providers";
import { LineList } from "@/components/ui-shell-line";
import { OrderNoteField, readCheckoutNote } from "@/components/ui-order-note";

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" fill="#d8c7a6" />
      <circle cx="24" cy="24" r="6" fill="#0b0b0b" />
    </svg>
  );
}

export function ShipBar({ subtotal }: { subtotal: number }) {
  const pct = Math.min(100, Math.round((subtotal / SHIP_FREE) * 100));
  const rest = Math.max(0, SHIP_FREE - subtotal);
  return (
    <div className="ship">
      <div className="faint">{subtotal >= SHIP_FREE ? "Kargo bu sepette yok." : `Ücretsiz kargoya ${money(rest)} kaldı.`}</div>
      <div className="ship-track" aria-hidden="true"><div className="ship-fill" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

function EmptyBag() {
  return (
    <div className="empty">
      <div className="mark" aria-hidden="true" />
      <h3>Sepet henüz boş</h3>
      <p>Keten, yün veya ev. Gridden bir parça ekle.</p>
    </div>
  );
}

export function CheckoutNote() {
  return <p className="faint" style={{ marginTop: 10 }}>ikas checkout simüle. Sipariş yerel deftere yazılır.</p>;
}

export { OrderNoteField } from "@/components/ui-order-note";

export function PayButton() {
  const { cart, checkout } = useCart();
  const { setCartOpen } = useAsk();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (cart.items.length === 0) return null;
  return (
    <button className="btn btn-primary" type="button" style={{ width: "100%" }} disabled={busy} onClick={async () => {
      setBusy(true);
      const order = await checkout(readCheckoutNote());
      setBusy(false);
      if (!order) return;
      setCartOpen(false);
      router.push(`/siparis?id=${encodeURIComponent(order.order_id)}`);
    }}>{busy ? "yazılıyor" : "Ödemeye geç"}</button>
  );
}

export function ClearCartButton({ className = "btn" }: { className?: string }) {
  const { cart, clear } = useCart();
  const [busy, setBusy] = useState(false);
  if (cart.items.length === 0) return null;
  return (
    <button className={className} type="button" disabled={busy} onClick={async () => {
      setBusy(true);
      try { await clear(); } finally { setBusy(false); }
    }}>{busy ? "…" : "Sepeti boşalt"}</button>
  );
}

export function CartDrawer() {
  const { cart } = useCart();
  const { cartOpen, setCartOpen } = useAsk();
  return (
    <>
      <div className="drawer-backdrop" hidden={!cartOpen} onClick={() => setCartOpen(false)} data-component="CartDrawer" />
      <aside className="drawer" hidden={!cartOpen} role="dialog" aria-label="Sepet" data-component="CartDrawer">
        <div className="drawer-head"><strong>Sepet</strong><button className="icon-btn" type="button" onClick={() => setCartOpen(false)} aria-label="Kapat">Kapat</button></div>
        <div className="drawer-body">{cart.items.length === 0 ? <EmptyBag /> : <LineList />}</div>
        <div className="drawer-foot">
          <ShipBar subtotal={cart.subtotal} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><span className="muted">Ara toplam</span><strong>{money(cart.subtotal)}</strong></div>
          <Link className="btn" href="/sepet" onClick={() => setCartOpen(false)} style={{ display: "block", textAlign: "center", marginBottom: 8 }}>Sepete git</Link>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}><ClearCartButton className="btn" /></div>
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
          <Link href="/siparislerim" className={`icon-btn ${path.startsWith("/siparislerim") ? "on" : ""}`} data-cta="my-orders">Siparişlerim</Link>
          <Link href="/merchant" className="icon-btn">Operatör</Link>
          <button className="icon-btn" type="button" onClick={() => setCartOpen(true)} aria-label="Sepet">
            Sepet{count > 0 ? <span className={`badge ${badgePop ? "ac-pop" : ""}`}>{count}</span> : null}
          </button>
        </div>
      </header>
      <CartDrawer />
      {children}
      <nav className="dock" aria-label="Mobil">
        <Link href="/" className={path === "/" ? "on" : ""}>Mağaza</Link>
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

export function ShopFooter() {
  return (
    <footer className="shop-foot">
      <div><h4>Kargo</h4><p>1–3 iş günü. {money(SHIP_FREE)} ve üzeri kargo yok.</p></div>
      <div><h4>İade</h4><p>30 gün. Etiket duruyorsa mağaza veya kargo ile.</p></div>
      <div><h4>Asistan</h4><p>Sağdaki ray veya alttaki Asistan. Katalog seed, canlı ikas değil.</p></div>
    </footer>
  );
}

const NAV = [
  { href: "/merchant", label: "Özet" },
  { href: "/merchant/sohbet", label: "Sohbet" },
  { href: "/merchant/bekleyen", label: "Bekleyen" },
  { href: "/merchant/katalog", label: "Katalog" },
  { href: "/merchant/stok", label: "Stok" },
  { href: "/merchant/siparisler", label: "Siparişler" },
];
export function MerchantShell({ children, current }: { children: ReactNode; current: string }) {
  return (
    <div className="portal">
      <nav className="sidenav" aria-label="Operatör">
        <div className="mark"><Logo size={22} />QANTE</div>
        {NAV.map((i) => <Link key={i.href} href={i.href} className={i.href === current ? "active" : ""}>{i.label}</Link>)}
        <Link href="/" className="faint" style={{ marginTop: 18 }}>Vitrine dön</Link>
        <p className="note">Nötr panel · seed veri · onay yerel deftere yazar</p>
      </nav>
      <div className="main">{children}</div>
    </div>
  );
}
