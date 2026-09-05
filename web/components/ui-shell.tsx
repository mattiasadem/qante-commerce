"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Cart } from "@/lib/core";
import { money, SHIP_FREE } from "@/lib/core";

const empty: Cart = { items: [], subtotal: 0, currency: "TRY" };
export type DemoOrder = { order_id: string; items: Cart["items"]; subtotal: number; currency: string; created_at: string };
type CartCtx = {
  cart: Cart; count: number; badgePop: boolean;
  add: (id: string, q?: number) => Promise<void>;
  update: (id: string, q: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  checkout: () => Promise<DemoOrder | null>;
  applyCart: (next: Cart) => void;
  refresh: () => Promise<void>;
};
const CartCtx = createContext<CartCtx | null>(null);
async function cartCall(body: object): Promise<Cart> {
  const res = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return (await res.json()) as Cart;
}
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(empty);
  const [badgePop, setBadgePop] = useState(false);
  const pop = useCallback(() => { setBadgePop(true); window.setTimeout(() => setBadgePop(false), 650); }, []);
  const refresh = useCallback(async () => {
    const res = await fetch("/api/cart", { cache: "no-store" });
    setCart(await res.json() as Cart);
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const applyCart = useCallback((next: Cart) => { setCart(next); pop(); }, [pop]);
  const add = useCallback(async (productId: string, qty = 1) => { setCart(await cartCall({ action: "add", productId, qty })); pop(); }, [pop]);
  const update = useCallback(async (productId: string, qty: number) => { setCart(await cartCall({ action: "update", productId, qty })); }, []);
  const remove = useCallback(async (productId: string) => { setCart(await cartCall({ action: "remove", productId })); }, []);
  const clear = useCallback(async () => { setCart(await cartCall({ action: "clear" })); }, []);
  const checkout = useCallback(async () => {
    const res = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "checkout" }) });
    const data = await res.json() as DemoOrder & { error?: string; items?: Cart["items"]; subtotal?: number };
    if (data.error || !data.order_id) return null;
    setCart({ items: [], subtotal: 0, currency: "TRY" });
    return data;
  }, []);
  const count = useMemo(() => cart.items.reduce((s, i) => s + i.qty, 0), [cart]);
  return <CartCtx.Provider value={{ cart, count, badgePop, add, update, remove, clear, checkout, applyCart, refresh }}>{children}</CartCtx.Provider>;
}
export function useCart(): CartCtx { const c = useContext(CartCtx); if (!c) throw new Error("useCart"); return c; }

type Ask = { message: string; productId?: string; n: number };
type AskCtx = { ask: Ask | null; requestAsk: (message: string, productId?: string) => void; sheetOpen: boolean; setSheetOpen: (v: boolean) => void; cartOpen: boolean; setCartOpen: (v: boolean) => void };
const AskContext = createContext<AskCtx | null>(null);
export function useAsk(): AskCtx { const c = useContext(AskContext); if (!c) throw new Error("useAsk"); return c; }
export function AskProvider({ children }: { children: ReactNode }) {
  const [ask, setAsk] = useState<Ask | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const requestAsk = useCallback((message: string, productId?: string) => {
    setAsk({ message, productId, n: Date.now() });
    setSheetOpen(true);
  }, []);
  return <AskContext.Provider value={{ ask, requestAsk, sheetOpen, setSheetOpen, cartOpen, setCartOpen }}>{children}</AskContext.Provider>;
}

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

export function LineList({ extra }: { extra?: boolean }) {
  const { cart, update, remove } = useCart();
  return (
    <>
      {cart.items.map((line) => (
        <div key={line.product_id} className="mini-product">
          <img src={line.product?.image} alt="" />
          <div>
            {extra ? <Link href={`/urun/${line.product_id}`}>{line.product?.name}</Link> : <div>{line.product?.name}</div>}
            <div className="faint">{money(line.line_total)}</div>
            <div className="stepper" style={{ marginTop: 8 }}>
              <button type="button" aria-label="Azalt" onClick={() => void update(line.product_id, line.qty - 1)}>−</button>
              <span>{line.qty}</span>
              <button type="button" aria-label="Artır" onClick={() => void update(line.product_id, line.qty + 1)}>+</button>
            </div>
          </div>
          <button className="chip" type="button" onClick={() => void remove(line.product_id)}>Sil</button>
        </div>
      ))}
    </>
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

export function PayButton() {
  const { cart, checkout } = useCart();
  const { setCartOpen } = useAsk();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (cart.items.length === 0) return null;
  return (
    <button className="btn btn-primary" type="button" style={{ width: "100%" }} disabled={busy} onClick={async () => {
      setBusy(true);
      const order = await checkout();
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
    <button
      className={className}
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try { await clear(); } finally { setBusy(false); }
      }}
    >
      {busy ? "…" : "Sepeti boşalt"}
    </button>
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
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <ClearCartButton className="btn" />
          </div>
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
          if (query) {
            requestAsk(query);
            router.push(`/?q=${encodeURIComponent(query)}`);
          } else router.push("/");
        }}>
          <input className="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ne arıyorsun" aria-label="Ara" />
        </form>
        <div className="header-actions">
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
