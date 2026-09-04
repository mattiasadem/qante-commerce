import { NextResponse } from "next/server";
import { applyOrderAction, computeIssues, mergeOrders, type Order, type OrderLedgerEntry } from "@/lib/core";

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
  } catch { return {}; }
}
function parseDemoOrders(raw?: string): Order[] {
  if (!raw) return [];
  try {
    const d = JSON.parse(raw) as Order[];
    return Array.isArray(d)
      ? d.filter((o) => o && typeof o.id === "string" && Array.isArray(o.items) && typeof o.total === "number")
      : [];
  } catch { return []; }
}
function ordersFor(req: Request) {
  return mergeOrders(parseOrderLedger(cookie(req, ORDER_LEDGER)), parseDemoOrders(cookie(req, DEMO_ORDERS)));
}

export async function GET(req: Request) {
  const orders = ordersFor(req);
  return NextResponse.json({
    orders,
    issues: computeIssues(new Date(), orders),
    writes_enabled: false,
    demo: true,
  });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { id?: string; action?: string };
  const id = body.id ?? "";
  const action = body.action ?? "";
  const ledger = parseOrderLedger(cookie(req, ORDER_LEDGER));
  const demos = parseDemoOrders(cookie(req, DEMO_ORDERS));
  const current = mergeOrders(ledger, demos).find((o) => o.id === id);
  if (!current) return NextResponse.json({ error: "not found" }, { status: 404 });
  const next = applyOrderAction(current.status, action);
  if (!next) return NextResponse.json({ error: "bad action" }, { status: 400 });
  ledger[id] = { status: next, decided_at: new Date().toISOString() };
  const orders = mergeOrders(ledger, demos);
  const order = orders.find((o) => o.id === id);
  const issues = computeIssues(new Date(), orders);
  const res = NextResponse.json({ order, orders, issues, demo: true, ikas_written: false });
  res.cookies.set(ORDER_LEDGER, JSON.stringify(ledger), { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
