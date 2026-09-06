import { NextResponse } from "next/server";
import { applyOrderAction, computeIssues, mergeOrders, type Order, type OrderLedgerEntry } from "@/lib/core";
import { formatShipNote } from "@/lib/ship-track";

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

/** Preserve existing ledger note across status transitions. */
function withPreservedNote(prev: OrderLedgerEntry | undefined, status: string, decided_at: string): OrderLedgerEntry {
  return prev?.note ? { status, decided_at, note: prev.note } : { status, decided_at };
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
  const body = (await req.json()) as {
    id?: string;
    ids?: string[];
    action?: string;
    carrier?: string;
    tracking?: string;
  };
  const action = body.action ?? "";
  const ledger = parseOrderLedger(cookie(req, ORDER_LEDGER));
  const demos = parseDemoOrders(cookie(req, DEMO_ORDERS));
  const now = new Date().toISOString();

  if (action === "ship_all") {
    const wanted = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === "string" && x) : [];
    const all = mergeOrders(ledger, demos);
    const targets = (wanted.length ? all.filter((o) => wanted.includes(o.id)) : all).filter((o) => o.status === "paid");
    if (!targets.length) return NextResponse.json({ error: "nothing to ship" }, { status: 400 });
    // Bulk ship: no per-row tracking; preserve any existing ledger note.
    for (const o of targets) ledger[o.id] = withPreservedNote(ledger[o.id], "shipped", now);
    const orders = mergeOrders(ledger, demos);
    const issues = computeIssues(new Date(), orders);
    const shipped = targets.map((t) => orders.find((o) => o.id === t.id)!).filter(Boolean);
    const res = NextResponse.json({
      orders,
      issues,
      shipped,
      count: shipped.length,
      demo: true,
      ikas_written: false,
    });
    res.cookies.set(ORDER_LEDGER, JSON.stringify(ledger), { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
    return res;
  }

  if (action === "fulfill_all") {
    const wanted = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === "string" && x) : [];
    const all = mergeOrders(ledger, demos);
    const targets = (wanted.length ? all.filter((o) => wanted.includes(o.id)) : all).filter((o) => o.status === "shipped");
    if (!targets.length) return NextResponse.json({ error: "nothing to fulfill" }, { status: 400 });
    for (const o of targets) ledger[o.id] = withPreservedNote(ledger[o.id], "fulfilled", now);
    const orders = mergeOrders(ledger, demos);
    const issues = computeIssues(new Date(), orders);
    const fulfilled = targets.map((t) => orders.find((o) => o.id === t.id)!).filter(Boolean);
    const res = NextResponse.json({
      orders,
      issues,
      fulfilled,
      count: fulfilled.length,
      demo: true,
      ikas_written: false,
    });
    res.cookies.set(ORDER_LEDGER, JSON.stringify(ledger), { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
    return res;
  }

  if (action === "close_return_all") {
    const wanted = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === "string" && x) : [];
    const all = mergeOrders(ledger, demos);
    const targets = (wanted.length ? all.filter((o) => wanted.includes(o.id)) : all).filter((o) => o.status === "return_requested");
    if (!targets.length) return NextResponse.json({ error: "nothing to close" }, { status: 400 });
    for (const o of targets) ledger[o.id] = withPreservedNote(ledger[o.id], "fulfilled", now);
    const orders = mergeOrders(ledger, demos);
    const issues = computeIssues(new Date(), orders);
    const closed = targets.map((t) => orders.find((o) => o.id === t.id)!).filter(Boolean);
    const res = NextResponse.json({
      orders,
      issues,
      closed,
      count: closed.length,
      demo: true,
      ikas_written: false,
    });
    res.cookies.set(ORDER_LEDGER, JSON.stringify(ledger), { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
    return res;
  }

  if (action === "mark_paid_all") {
    const wanted = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === "string" && x) : [];
    const all = mergeOrders(ledger, demos);
    const targets = (wanted.length ? all.filter((o) => wanted.includes(o.id)) : all).filter((o) => o.status === "pending_payment");
    if (!targets.length) return NextResponse.json({ error: "nothing to mark paid" }, { status: 400 });
    for (const o of targets) ledger[o.id] = withPreservedNote(ledger[o.id], "paid", now);
    const orders = mergeOrders(ledger, demos);
    const issues = computeIssues(new Date(), orders);
    const paid = targets.map((t) => orders.find((o) => o.id === t.id)!).filter(Boolean);
    const res = NextResponse.json({
      orders,
      issues,
      paid,
      count: paid.length,
      demo: true,
      ikas_written: false,
    });
    res.cookies.set(ORDER_LEDGER, JSON.stringify(ledger), { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
    return res;
  }

  if (action === "cancel_all") {
    const wanted = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === "string" && x) : [];
    const all = mergeOrders(ledger, demos);
    const targets = (wanted.length ? all.filter((o) => wanted.includes(o.id)) : all).filter(
      (o) => o.status === "paid" || o.status === "pending_payment",
    );
    if (!targets.length) return NextResponse.json({ error: "nothing to cancel" }, { status: 400 });
    for (const o of targets) ledger[o.id] = withPreservedNote(ledger[o.id], "cancelled", now);
    const orders = mergeOrders(ledger, demos);
    const issues = computeIssues(new Date(), orders);
    const cancelled = targets.map((t) => orders.find((o) => o.id === t.id)!).filter(Boolean);
    const res = NextResponse.json({
      orders,
      issues,
      cancelled,
      count: cancelled.length,
      demo: true,
      ikas_written: false,
    });
    res.cookies.set(ORDER_LEDGER, JSON.stringify(ledger), { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
    return res;
  }

  const id = body.id ?? "";
  const current = mergeOrders(ledger, demos).find((o) => o.id === id);
  if (!current) return NextResponse.json({ error: "not found" }, { status: 404 });
  const next = applyOrderAction(current.status, action);
  if (!next) return NextResponse.json({ error: "bad action" }, { status: 400 });

  let entry: OrderLedgerEntry = withPreservedNote(ledger[id], next, now);
  if (action === "ship") {
    const note = formatShipNote(
      typeof body.carrier === "string" ? body.carrier : undefined,
      typeof body.tracking === "string" ? body.tracking : undefined,
    );
    if (note) entry = { status: next, decided_at: now, note };
  }
  ledger[id] = entry;

  const orders = mergeOrders(ledger, demos);
  const order = orders.find((o) => o.id === id);
  const issues = computeIssues(new Date(), orders);
  const res = NextResponse.json({ order, orders, issues, demo: true, ikas_written: false });
  res.cookies.set(ORDER_LEDGER, JSON.stringify(ledger), { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
