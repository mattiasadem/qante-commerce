import { NextResponse } from "next/server";
import { demoTurn, getProduct } from "@/lib/core";
import { buildTurnEvents, streamEvents } from "@/lib/stream-protocol";

export const dynamic = "force-dynamic";
const CART = "qante_cart";
type Line = { product_id: string; qty: number };

function cookie(req: Request, name: string) {
  const m = (req.headers.get("cookie") ?? "").split(";").map((p) => p.trim()).find((p) => p.startsWith(`${name}=`));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : "";
}
function parseCart(raw?: string): Line[] {
  if (!raw) return [];
  try { const d = JSON.parse(raw) as Line[]; return Array.isArray(d) ? d.filter((l) => l.product_id && l.qty > 0) : []; } catch { return []; }
}
function enrich(items: Line[]) {
  const lines = items.map((item) => {
    const product = getProduct(item.product_id) ?? null;
    return { ...item, product, line_total: product ? Math.round(product.price * item.qty * 100) / 100 : 0 };
  });
  return { items: lines, subtotal: Math.round(lines.reduce((s, l) => s + l.line_total, 0) * 100) / 100, currency: "TRY" };
}

export async function POST(req: Request) {
  const body = (await req.json()) as { message?: string; productId?: string; product_id?: string };
  const message = (body.message ?? "").trim() || "öne çıkanlar";
  const productId = body.productId ?? body.product_id ?? null;
  const turn = demoTurn(message, productId);
  const accept = req.headers.get("accept") ?? "";

  let cartPayload: ReturnType<typeof enrich> | undefined;
  let cartCookie: string | undefined;
  if (turn.add_product_id) {
    let items = parseCart(cookie(req, CART));
    const pid = turn.add_product_id;
    const found = items.find((i) => i.product_id === pid);
    if (found) found.qty += 1;
    else items.push({ product_id: pid, qty: 1 });
    cartPayload = enrich(items);
    cartCookie = JSON.stringify(items);
  }

  if (accept.includes("text/event-stream")) {
    const events = buildTurnEvents({
      text: turn.text,
      ui: turn.ui,
      suggestions: turn.suggestions,
      activity: turn.activity,
      activity_steps: turn.activity_steps,
      cart: cartPayload,
      addProductId: turn.add_product_id,
    });
    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        await streamEvents(events, (chunk) => controller.enqueue(enc.encode(chunk)));
        controller.close();
      },
    });
    const res = new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
    if (cartCookie) {
      res.headers.append("Set-Cookie", `${CART}=${encodeURIComponent(cartCookie)}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`);
    }
    return res;
  }
  if (cartCookie && cartPayload) {
    const res = NextResponse.json({ ...turn, cart: cartPayload });
    res.cookies.set(CART, cartCookie, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
    return res;
  }
  return NextResponse.json(turn);
}
