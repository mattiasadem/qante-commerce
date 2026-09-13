import { NextResponse } from "next/server";
import type { LedgerEntry, Order, OrderLedgerEntry, StagedChange } from "@/lib/core";
import { getProduct, mergeOrders } from "@/lib/core";

export const CART = "qante_cart";
export const ORDER = "qante_order";
export const LEDGER = "qante_ledger";
export const EXTRA = "qante_extra_staged";
export const ORDER_LEDGER = "qante_order_ledger";
export const DEMO_ORDERS = "qante_demo_orders";
export type Line = { product_id: string; qty: number };

export function cookie(req: Request, name: string) {
  const m = (req.headers.get("cookie") ?? "").split(";").map((p) => p.trim()).find((p) => p.startsWith(`${name}=`));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : "";
}
export function parseCart(raw?: string): Line[] {
  if (!raw) return [];
  try { const d = JSON.parse(raw) as Line[]; return Array.isArray(d) ? d.filter((l) => l.product_id && l.qty > 0) : []; } catch { return []; }
}
export function parseLedger(raw?: string): Record<string, LedgerEntry> {
  if (!raw) return {};
  try { const d = JSON.parse(raw) as Record<string, LedgerEntry>; return d && typeof d === "object" ? d : {}; } catch { return {}; }
}
export function parseExtras(raw?: string): StagedChange[] {
  if (!raw) return [];
  try {
    const d = JSON.parse(raw) as StagedChange[];
    return Array.isArray(d) ? d.filter((c) => c && c.id && c.product_id && c.kind) : [];
  } catch { return []; }
}
export function parseOrderLedger(raw?: string): Record<string, OrderLedgerEntry> {
  if (!raw) return {};
  try {
    const d = JSON.parse(raw) as Record<string, OrderLedgerEntry>;
    return d && typeof d === "object" ? d : {};
  } catch { return {}; }
}
export function parseDemoOrders(raw?: string): Order[] {
  if (!raw) return [];
  try {
    const d = JSON.parse(raw) as Order[];
    return Array.isArray(d)
      ? d.filter((o) => o && typeof o.id === "string" && Array.isArray(o.items) && typeof o.total === "number")
      : [];
  } catch { return []; }
}
export function ordersFor(req: Request) {
  return mergeOrders(parseOrderLedger(cookie(req, ORDER_LEDGER)), parseDemoOrders(cookie(req, DEMO_ORDERS)));
}
export function enrich(items: Line[]) {
  const lines = items.map((item) => {
    const product = getProduct(item.product_id) ?? null;
    return { ...item, product, line_total: product ? Math.round(product.price * item.qty * 100) / 100 : 0 };
  });
  return { items: lines, subtotal: Math.round(lines.reduce((s, l) => s + l.line_total, 0) * 100) / 100, currency: "TRY" };
}
export function setCookies(res: NextResponse, pairs: { name: string; value: string }[]) {
  for (const p of pairs) res.cookies.set(p.name, p.value, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
