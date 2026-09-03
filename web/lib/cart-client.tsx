"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Cart } from "@/lib/types";

const empty: Cart = { items: [], subtotal: 0, currency: "TRY" };

type CartCtx = {
  cart: Cart;
  count: number;
  refresh: () => Promise<void>;
  add: (productId: string, qty?: number) => Promise<void>;
  update: (productId: string, qty: number) => Promise<void>;
  remove: (productId: string) => Promise<void>;
};

const Ctx = createContext<CartCtx | null>(null);

async function call(body: object): Promise<Cart> {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as Cart;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(empty);
  const refresh = useCallback(async () => {
    const res = await fetch("/api/cart", { cache: "no-store" });
    setCart((await res.json()) as Cart);
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const add = useCallback(async (productId: string, qty = 1) => {
    setCart(await call({ action: "add", productId, qty }));
  }, []);
  const update = useCallback(async (productId: string, qty: number) => {
    setCart(await call({ action: "update", productId, qty }));
  }, []);
  const remove = useCallback(async (productId: string) => {
    setCart(await call({ action: "remove", productId }));
  }, []);
  const count = useMemo(() => cart.items.reduce((s, i) => s + i.qty, 0), [cart]);
  return (
    <Ctx.Provider value={{ cart, count, refresh, add, update, remove }}>{children}</Ctx.Provider>
  );
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart outside provider");
  return ctx;
}
