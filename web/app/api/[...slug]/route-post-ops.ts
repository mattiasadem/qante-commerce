import { NextResponse } from "next/server";
import { formatShipNote } from "@/lib/ship-track";
import { applyOrderAction, buildListingStage, buildPriceStage, buildStockStage, getProduct, mergeOrders, computeIssues, type OrderLedgerEntry, type StagedChange } from "@/lib/core";
import {
  EXTRA, ORDER_LEDGER, DEMO_ORDERS,
  cookie, parseExtras, parseOrderLedger, parseDemoOrders, setCookies,
} from "./route-shared";

export async function handlePostOps(req: Request, slug: string): Promise<Response | null> {
  if (slug === "merchant/stage") {
    const body = (await req.json()) as {
      kind?: string; action?: string; product_id?: string; productId?: string;
      product_ids?: string[]; target_qty?: number; target_price?: number;
    };
    if (body.action === "restock_all") {
      const raw = Array.isArray(body.product_ids) ? body.product_ids : [];
      const ids = [...new Set(raw.map((id) => String(id ?? "").trim()).filter(Boolean))].slice(0, 12);
      const stamp = Date.now().toString(36);
      const changes: StagedChange[] = [];
      for (let i = 0; i < ids.length; i++) {
        const product = getProduct(ids[i]);
        if (!product) continue;
        const change = buildStockStage(product);
        changes.push({ ...change, id: `chg_stock_${product.id}_${stamp}_${i}` });
      }
      if (!changes.length) return NextResponse.json({ error: "no products" }, { status: 400 });
      const extras = [...changes, ...parseExtras(cookie(req, EXTRA))].slice(0, 40);
      const res = NextResponse.json({ changes, count: changes.length, demo: true, ikas_written: false });
      return setCookies(res, [{ name: EXTRA, value: JSON.stringify(extras) }]);
    }
    if (body.action === "price_all") {
      const raw = Array.isArray(body.product_ids) ? body.product_ids : [];
      const ids = [...new Set(raw.map((id) => String(id ?? "").trim()).filter(Boolean))].slice(0, 12);
      const stamp = Date.now().toString(36);
      const changes: StagedChange[] = [];
      for (let i = 0; i < ids.length; i++) {
        const product = getProduct(ids[i]);
        if (!product) continue;
        const change = buildPriceStage(product);
        changes.push({ ...change, id: `chg_price_${product.id}_${stamp}_${i}` });
      }
      if (!changes.length) return NextResponse.json({ error: "no products" }, { status: 400 });
      const extras = [...changes, ...parseExtras(cookie(req, EXTRA))].slice(0, 40);
      const res = NextResponse.json({ changes, count: changes.length, demo: true, ikas_written: false });
      return setCookies(res, [{ name: EXTRA, value: JSON.stringify(extras) }]);
    }
    if (body.action === "listing_all") {
      const raw = Array.isArray(body.product_ids) ? body.product_ids : [];
      const ids = [...new Set(raw.map((id) => String(id ?? "").trim()).filter(Boolean))].slice(0, 12);
      const stamp = Date.now().toString(36);
      const changes: StagedChange[] = [];
      for (let i = 0; i < ids.length; i++) {
        const product = getProduct(ids[i]);
        if (!product) continue;
        const change = buildListingStage(product);
        changes.push({ ...change, id: `chg_listing_${product.id}_${stamp}_${i}` });
      }
      if (!changes.length) return NextResponse.json({ error: "no products" }, { status: 400 });
      const extras = [...changes, ...parseExtras(cookie(req, EXTRA))].slice(0, 40);
      const res = NextResponse.json({ changes, count: changes.length, demo: true, ikas_written: false });
      return setCookies(res, [{ name: EXTRA, value: JSON.stringify(extras) }]);
    }
    const productId = body.product_id ?? body.productId ?? "";
    const product = getProduct(productId);
    if (!product) return NextResponse.json({ error: "product not found" }, { status: 404 });
    const kind = body.kind ?? "stock";
    let change: StagedChange;
    if (kind === "stock") change = buildStockStage(product, body.target_qty);
    else if (kind === "listing") change = buildListingStage(product);
    else if (kind === "price") change = buildPriceStage(product, body.target_price);
    else return NextResponse.json({ error: "kind unsupported" }, { status: 400 });
    const extras = [change, ...parseExtras(cookie(req, EXTRA))].slice(0, 40);
    const res = NextResponse.json({ change, demo: true, ikas_written: false });
    return setCookies(res, [{ name: EXTRA, value: JSON.stringify(extras) }]);
  }
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
