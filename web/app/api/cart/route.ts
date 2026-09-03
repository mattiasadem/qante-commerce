import { NextResponse } from "next/server";
import { getProduct } from "@/lib/seed";

export const dynamic = "force-dynamic";

const COOKIE = "qante_cart";

type Line = { product_id: string; qty: number };

function parse(raw: string | undefined): Line[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as Line[];
    return Array.isArray(data) ? data.filter((l) => l.product_id && l.qty > 0) : [];
  } catch {
    return [];
  }
}

function enrich(items: Line[]) {
  const lines = items.map((item) => {
    const product = getProduct(item.product_id) ?? null;
    const line_total = product ? Math.round(product.price * item.qty * 100) / 100 : 0;
    return { ...item, product, line_total };
  });
  const subtotal = Math.round(lines.reduce((s, l) => s + l.line_total, 0) * 100) / 100;
  return { items: lines, subtotal, currency: "TRY" };
}

function withCookie(body: unknown, items: Line[]) {
  const res = NextResponse.json(body);
  res.cookies.set(COOKIE, JSON.stringify(items), {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.split(";").map((p) => p.trim()).find((p) => p.startsWith(`${COOKIE}=`));
  const raw = match ? decodeURIComponent(match.slice(COOKIE.length + 1)) : "";
  return NextResponse.json(enrich(parse(raw)));
}

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.split(";").map((p) => p.trim()).find((p) => p.startsWith(`${COOKIE}=`));
  const raw = match ? decodeURIComponent(match.slice(COOKIE.length + 1)) : "";
  let items = parse(raw);
  const body = (await req.json()) as {
    action?: string;
    productId?: string;
    product_id?: string;
    qty?: number;
  };
  const productId = body.productId ?? body.product_id;
  const qty = body.qty ?? 1;
  const action = body.action ?? "add";
  if (action === "clear") items = [];
  else if (productId && action === "remove") items = items.filter((i) => i.product_id !== productId);
  else if (productId && action === "update") {
    if (qty <= 0) items = items.filter((i) => i.product_id !== productId);
    else {
      const found = items.find((i) => i.product_id === productId);
      if (found) found.qty = qty;
      else items.push({ product_id: productId, qty });
    }
  } else if (productId) {
    const found = items.find((i) => i.product_id === productId);
    if (found) found.qty += qty;
    else items.push({ product_id: productId, qty });
  }
  return withCookie(enrich(items), items);
}
