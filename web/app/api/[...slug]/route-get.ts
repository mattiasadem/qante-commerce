import { NextResponse } from "next/server";
import { BRAND, getProduct, getProducts, mergeStaged, logoSvg, computeAlerts, computeIssues, computeSnapshot, weeklyBars } from "@/lib/core";
import {
  CART, ORDER, LEDGER, EXTRA,
  cookie, parseCart, parseLedger, parseExtras, ordersFor, enrich,
} from "./route-shared";

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
          const deskNote = (desk?.buyer_note ?? "").trim();
          const sessionNote = (order.note ?? "").trim();
          return NextResponse.json({
            ...order,
            note: sessionNote || deskNote || order.note,
            status: desk?.status ?? order.status ?? "paid",
            ship_note: desk?.ship_note ?? (order as { ship_note?: string }).ship_note,
          });
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
        const seedNote = (o.buyer_note ?? "").trim();
        return NextResponse.json({
          order_id: o.id,
          items,
          subtotal: o.total,
          created_at: o.created_at,
          note: seedNote || "seed sipariş · yerel defter · Siparişler'e düşer",
          status: o.status,
          ship_note: o.ship_note,
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
