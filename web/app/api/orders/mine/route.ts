import { NextResponse } from "next/server";
import { getProduct, isStoreCheckoutOrder, mergeOrders, type Order, type OrderLedgerEntry } from "@/lib/core";

export const dynamic = "force-dynamic";

const ORDER_LEDGER = "qante_order_ledger";
const DEMO_ORDERS = "qante_demo_orders";

function cookie(req: Request, name: string) {
  const m = (req.headers.get("cookie") ?? "").split(";").map((p) => p.trim()).find((p) => p.startsWith(`${name}=`));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : "";
}
function parseOrderLedger(raw?: string): Record<string, OrderLedgerEntry> {
  if (!raw) return {};
  try {
    const d = JSON.parse(raw) as Record<string, OrderLedgerEntry>;
    return d && typeof d === "object" ? d : {};
  } catch {
    return {};
  }
}
function parseDemoOrders(raw?: string): Order[] {
  if (!raw) return [];
  try {
    const d = JSON.parse(raw) as Order[];
    return Array.isArray(d)
      ? d.filter((o) => o && typeof o.id === "string" && Array.isArray(o.items) && typeof o.total === "number")
      : [];
  } catch {
    return [];
  }
}

/** Buyer Siparişlerim: session checkout rows only (ord_demo_*), not seed merchant desk. */
export async function GET(req: Request) {
  const ledger = parseOrderLedger(cookie(req, ORDER_LEDGER));
  const demos = parseDemoOrders(cookie(req, DEMO_ORDERS)).filter((o) => isStoreCheckoutOrder(o.id));
  const orders = mergeOrders(ledger, demos).filter((o) => isStoreCheckoutOrder(o.id));
  const rows = orders.map((o) => ({
    order_id: o.id,
    created_at: o.created_at,
    status: o.status,
    total: o.total,
    ship_note: o.ship_note,
    item_count: o.items.reduce((s, l) => s + l.qty, 0),
    items: o.items.slice(0, 4).map((l) => ({
      product_id: l.product_id,
      name: getProduct(l.product_id)?.name ?? l.product_id,
      qty: l.qty,
    })),
  }));
  return NextResponse.json({ orders: rows, count: rows.length, demo: true });
}
