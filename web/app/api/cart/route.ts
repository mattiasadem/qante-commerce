import { NextResponse } from "next/server";
import { getProduct, type Order } from "@/lib/core";

export const dynamic = "force-dynamic";

const CART = "qante_cart";
const ORDER = "qante_order";
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
function parseDemoOrders(raw?: string): Order[] {
  if (!raw) return [];
  try {
    const d = JSON.parse(raw) as Order[];
    return Array.isArray(d)
      ? d.filter((o) => o && typeof o.id === "string" && Array.isArray(o.items) && typeof o.total === "number")
      : [];
  } catch { return []; }
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

export async function GET(req: Request) {
  return NextResponse.json(enrich(parseCart(cookie(req, CART))));
}

export async function POST(req: Request) {
  let items = parseCart(cookie(req, CART));
  const body = (await req.json()) as { action?: string; productId?: string; product_id?: string; qty?: number; note?: string };
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
      note: (() => {
        const buyer = typeof body.note === "string" ? body.note.trim().slice(0, 240) : "";
        return buyer
          ? `Alıcı notu: ${buyer} · ikas checkout simüle · yerel defter`
          : "ikas checkout simüle · yerel defter · Siparişler'e düşer";
      })(),
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
