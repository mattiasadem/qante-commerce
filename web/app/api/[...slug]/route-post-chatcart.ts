import { NextResponse } from "next/server";
import { demoTurn, merchantTurn, type Order } from "@/lib/core";
import {
  CART, ORDER, DEMO_ORDERS,
  cookie, parseCart, parseDemoOrders,
  enrich, setCookies,
} from "./route-shared";

export async function handlePostChatCart(req: Request, slug: string): Promise<Response | null> {
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
  return null;
}
