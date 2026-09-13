import { NextResponse } from "next/server";
import { formatShipNote } from "@/lib/ship-track";
import { applyOrderAction, mergeOrders, computeIssues, type OrderLedgerEntry } from "@/lib/core";
import {
  ORDER_LEDGER, DEMO_ORDERS,
  cookie, parseOrderLedger, parseDemoOrders, setCookies,
} from "./route-shared";

export async function handlePostOrders(req: Request, slug: string): Promise<Response | null> {
  if (slug === "merchant/orders") {
    const body = (await req.json()) as { id?: string; action?: string; carrier?: string; tracking?: string };
    const id = body.id ?? "";
    const action = body.action ?? "";
    const ledger = parseOrderLedger(cookie(req, ORDER_LEDGER));
    const demos = parseDemoOrders(cookie(req, DEMO_ORDERS));
    const current = mergeOrders(ledger, demos).find((o) => o.id === id);
    if (!current) return NextResponse.json({ error: "not found" }, { status: 404 });
    const next = applyOrderAction(current.status, action);
    if (!next) return NextResponse.json({ error: "bad action" }, { status: 400 });
    const decided_at = new Date().toISOString();
    const prev = ledger[id];
    let entry: OrderLedgerEntry = prev?.note ? { status: next, decided_at, note: prev.note } : { status: next, decided_at };
    if (action === "ship") {
      const note = formatShipNote(
        typeof body.carrier === "string" ? body.carrier : undefined,
        typeof body.tracking === "string" ? body.tracking : undefined,
      );
      if (note) entry = { status: next, decided_at, note };
    }
    ledger[id] = entry;
    const orders = mergeOrders(ledger, demos);
    const order = orders.find((o) => o.id === id);
    const issues = computeIssues(new Date(), orders);
    const res = NextResponse.json({ order, orders, issues, demo: true, ikas_written: false });
    return setCookies(res, [{ name: ORDER_LEDGER, value: JSON.stringify(ledger) }]);
  }
  return null;
}
