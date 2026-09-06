"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Cart } from "@/lib/core";
import { clearCoupon } from "@/components/ui-coupon";

const empty: Cart = { items: [], subtotal: 0, currency: "TRY" };
export type DemoOrder = { order_id: string; items: Cart["items"]; subtotal: number; currency: string; created_at: string };
type CartCtx = {
  cart: Cart; count: number; badgePop: boolean;
  add: (id: string, q?: number) => Promise<void>;
  update: (id: string, q: number) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
  checkout: (note?: string) => Promise<DemoOrder | null>;
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
  const checkout = useCallback(async (note?: string) => {
    const body: { action: string; note?: string } = { action: "checkout" };
    const trimmed = (note ?? "").trim();
    if (trimmed) body.note = trimmed.slice(0, 400);
    const res = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json() as DemoOrder & { error?: string };
    if (data.error || !data.order_id) return null;
    setCart({ items: [], subtotal: 0, currency: "TRY" });
    try { sessionStorage.removeItem("qante_checkout_note"); } catch { /* ignore */ }
    try { clearCoupon(); } catch { /* ignore */ }
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
