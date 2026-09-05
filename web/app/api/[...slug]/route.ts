import { NextResponse } from "next/server";
import { BRAND, applyOrderAction, buildListingStage, buildPriceStage, buildStockStage, demoTurn, getProduct, getProducts, mergeOrders, mergeStaged, logoSvg, merchantTurn, computeAlerts, computeIssues, computeSnapshot, weeklyBars, type LedgerEntry, type Order, type OrderLedgerEntry, type StagedChange } from "@/lib/core";

export const dynamic = "force-dynamic";
const CART = "qante_cart";
const ORDER = "qante_order";
const LEDGER = "qante_ledger";
const EXTRA = "qante_extra_staged";
const ORDER_LEDGER = "qante_order_ledger";
const DEMO_ORDERS = "qante_demo_orders";
type Line = { product_id: string; qty: number };

function cookie(req: Request, name: string) {
  const m = (req.headers.get("cookie") ?? "").split(";").map((p) => p.trim()).find((p) => p.startsWith(`${name}=`));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : "";
}
function parseCart(raw?: string): Line[] {
  if (!raw) return [];
  try { const d = JSON.parse(raw) as Line[]; return Array.isArray(d) ? d.filter((l) => l.product_id && l.qty > 0) : []; } catch { return []; }
}
function parseLedger(raw?: string): Record<string, LedgerEntry> {
  if (!raw) return {};
  try { const d = JSON.parse(raw) as Record<string, LedgerEntry>; return d && typeof d === "object" ? d : {}; } catch { return {}; }
}
function parseExtras(raw?: string): StagedChange[] {
  if (!raw) return [];
  try {
    const d = JSON.parse(raw) as StagedChange[];
    return Array.isArray(d) ? d.filter((c) => c && c.id && c.kind && c.product_id) : [];
  } catch { return []; }
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
function enrich(items: Line[]) {
  const lines = items.map((item) => {
    const product = getProduct(item.product_id) ?? null;
    return { ...item, product, line_total: product ? Math.round(product.price * item.qty * 100) / 100 : 0 };
  });
  return { items: lines, subtotal: Math.round(lines.reduce((s, l) => s + l.line_total, 0) * 100) / 100, currency: "TRY" };
}
function setCookies(res: NextResponse, pairs: { name: string; value: string }[]) {
  for (const p of pairs) res.cookies.set(p.name, p.value, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
  return res;
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const slug = (await params).slug.join("/");
  const url = new URL(req.url);
  if (slug === "brand") return NextResponse.json({ ...BRAND, logo_svg: logoSvg(32) });
  if (slug === "products") return NextResponse.json({ products: getProducts() });
  if (slug === "cart") return NextResponse.json(enrich(parseCart(cookie(req, CART))));
  if (slug === "order" || slug === "orders/last") {
    const want = url.searchParams.get("id");
    const all = ordersFor(req);
    const raw = cookie(req, ORDER);
    if (raw) {
      try {
        const order = JSON.parse(raw) as {
          order_id: string;
          status?: string;
          items?: { product_id: string; name: string; qty: number; price: number; line_total: number }[];
          subtotal?: number;
          created_at?: string;
          note?: string;
        };
        if (!want || want === order.order_id) {
          const desk = all.find((o) => o.id === order.order_id);
          return NextResponse.json({ ...order, status: desk?.status ?? order.status ?? "paid" });
        }
      } catch { /* fall through to seed */ }
    }
    if (want) {
      const o = all.find((x) => x.id === want);
      if (o) {
        const items = o.items.map((l) => {
          const name = getProduct(l.product_id)?.name ?? l.product_id;
          return { product_id: l.product_id, name, qty: l.qty, price: l.price, line_total: Math.round(l.qty * l.price * 100) / 100 };
        });
        return NextResponse.json({
          order_id: o.id,
          items,
          subtotal: o.total,
          created_at: o.created_at,
          note: "seed sipariş · yerel defter · Siparişler'e düşer",
          status: o.status,
        });
      }
    }
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (slug === "merchant/reads/snapshot" || slug === "merchant/snapshot") return NextResponse.json(computeSnapshot());
  if (slug === "merchant/reads/alerts" || slug === "merchant/alerts") return NextResponse.json({ alerts: computeAlerts() });
  if (slug === "merchant/reads/issues" || slug === "merchant/issues") return NextResponse.json({ issues: computeIssues() });
  if (slug === "merchant/reads/weekly" || slug === "merchant/weekly") return NextResponse.json({ bars: weeklyBars() });
  if (slug === "merchant/reads/staged" || slug === "merchant/staged") {
    return NextResponse.json({
      changes: mergeStaged(parseLedger(cookie(req, LEDGER)), parseExtras(cookie(req, EXTRA))),
      writes_enabled: false,
      demo: true,
    });
  }
  if (slug === "merchant/reads/orders" || slug === "merchant/orders") {
    const orders = ordersFor(req);
    return NextResponse.json({
      orders,
      issues: computeIssues(new Date(), orders),
      writes_enabled: false,
      demo: true,
    });
  }
  return NextResponse.json({ error: "not found" }, { status: 404 });
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const slug = (await params).slug.join("/");
  if (slug === "chat" || slug === "merchant/chat") {
    const body = (await req.json()) as { message?: string; productId?: string; product_id?: string };
    const msg = (body.message ?? "").trim() || "öne çıkanlar";
    const turn = slug === "merchant/chat" ? merchantTurn(msg) : demoTurn(msg, body.productId ?? body.product_id ?? null);
    if ((req.headers.get("accept") ?? "").includes("text/event-stream")) {
      const chunks = [
        `data: ${JSON.stringify({ type: "activity", content: turn.activity })}\n\n`,
        `data: ${JSON.stringify({ type: "text", content: turn.text })}\n\n`,
        `data: ${JSON.stringify({ type: "ui", ui: turn.ui })}\n\n`,
        `data: ${JSON.stringify({ type: "suggestions", suggestions: turn.suggestions })}\n\n`,
        `data: ${JSON.stringify({ type: "done" })}\n\n`,
      ];
      return new Response(chunks.join(""), { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache" } });
    }
    return NextResponse.json(turn);
  }
  if (slug === "cart") {
    let items = parseCart(cookie(req, CART));
    const body = (await req.json()) as { action?: string; productId?: string; product_id?: string; qty?: number };
    const productId = body.productId ?? body.product_id;
    const qty = body.qty ?? 1;
    const action = body.action ?? "add";
    if (action === "checkout") {
      const cart = enrich(items);
      if (cart.items.length === 0) return NextResponse.json({ error: "empty" }, { status: 400 });
      const order_id = `ord_demo_${Date.now().toString(36)}`;
      const created_at = new Date().toISOString();
      const order = {
        order_id,
        items: cart.items.map((l) => ({ product_id: l.product_id, name: l.product?.name ?? l.product_id, qty: l.qty, price: l.product?.price ?? 0, line_total: l.line_total })),
        subtotal: cart.subtotal,
        currency: "TRY",
        created_at,
        status: "paid",
        note: "ikas checkout simüle · yerel defter · Siparişler'e düşer",
      };
      const deskOrder: Order = {
        id: order_id,
        created_at,
        status: "paid",
        total: cart.subtotal,
        items: cart.items.map((l) => ({ product_id: l.product_id, qty: l.qty, price: l.product?.price ?? 0 })),
      };
      const demoOrders = [deskOrder, ...parseDemoOrders(cookie(req, DEMO_ORDERS)).filter((o) => o.id !== order_id)].slice(0, 24);
      const res = NextResponse.json(order);
      return setCookies(res, [
        { name: CART, value: JSON.stringify([]) },
        { name: ORDER, value: JSON.stringify(order) },
        { name: DEMO_ORDERS, value: JSON.stringify(demoOrders) },
      ]);
    }
    if (action === "clear") items = [];
    else if (productId && action === "remove") items = items.filter((i) => i.product_id !== productId);
    else if (productId && action === "update") {
      if (qty <= 0) items = items.filter((i) => i.product_id !== productId);
      else {
        const f = items.find((i) => i.product_id === productId);
        if (f) f.qty = qty; else items.push({ product_id: productId, qty });
      }
    } else if (productId) {
      const f = items.find((i) => i.product_id === productId);
      if (f) f.qty += qty; else items.push({ product_id: productId, qty });
    }
    const res = NextResponse.json(enrich(items));
    return setCookies(res, [{ name: CART, value: JSON.stringify(items) }]);
  }
  if (slug === "merchant/changes") {
    const body = (await req.json()) as { id?: string; ids?: string[]; action?: string; reason?: string };
    const ledger = parseLedger(cookie(req, LEDGER));
    const extras = parseExtras(cookie(req, EXTRA));
    const now = new Date().toISOString();

    if (body.action === "approve_all") {
      const wanted = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === "string" && x) : [];
      const pending = mergeStaged(ledger, extras).filter((c) => c.status === "staged");
      const targets = wanted.length ? pending.filter((c) => wanted.includes(c.id)) : pending;
      if (!targets.length) return NextResponse.json({ error: "nothing to approve" }, { status: 400 });
      for (const c of targets) ledger[c.id] = { status: "applied", decided_at: now };
      const merged = mergeStaged(ledger, extras);
      const changes = targets.map((t) => merged.find((c) => c.id === t.id)!).filter(Boolean);
      const res = NextResponse.json({ changes, demo: true, ikas_written: false, count: changes.length });
      return setCookies(res, [{ name: LEDGER, value: JSON.stringify(ledger) }]);
    }

    if (body.action === "discard_all") {
      const wanted = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === "string" && x) : [];
      const note = (body.reason ?? "").trim();
      if (!note) return NextResponse.json({ error: "reason required" }, { status: 400 });
      const pending = mergeStaged(ledger, extras).filter((c) => c.status === "staged");
      const targets = wanted.length ? pending.filter((c) => wanted.includes(c.id)) : pending;
      if (!targets.length) return NextResponse.json({ error: "nothing to discard" }, { status: 400 });
      for (const c of targets) ledger[c.id] = { status: "discarded", decision_note: note, decided_at: now };
      const merged = mergeStaged(ledger, extras);
      const changes = targets.map((t) => merged.find((c) => c.id === t.id)!).filter(Boolean);
      const res = NextResponse.json({ changes, demo: true, ikas_written: false, count: changes.length });
      return setCookies(res, [{ name: LEDGER, value: JSON.stringify(ledger) }]);
    }

    const id = body.id ?? "";
    const current = mergeStaged(ledger, extras).find((c) => c.id === id);
    if (!current) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (body.action === "discard") {
      const note = (body.reason ?? "").trim();
      if (!note) return NextResponse.json({ error: "reason required" }, { status: 400 });
      ledger[id] = { status: "discarded", decision_note: note, decided_at: now };
    } else if (body.action === "approve") {
      ledger[id] = { status: "applied", decided_at: now };
    } else return NextResponse.json({ error: "bad action" }, { status: 400 });
    const change = mergeStaged(ledger, extras).find((c) => c.id === id);
    const res = NextResponse.json({ change, demo: true, ikas_written: false });
    return setCookies(res, [{ name: LEDGER, value: JSON.stringify(ledger) }]);
  }

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
    return setCookies(res, [{ name: ORDER_LEDGER, value: JSON.stringify(ledger) }]);
  }
  return NextResponse.json({ error: "not found" }, { status: 404 });

}
