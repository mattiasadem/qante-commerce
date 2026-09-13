import { NextResponse } from "next/server";
import { buildListingStage, buildPriceStage, buildStockStage, getProduct, type StagedChange } from "@/lib/core";
import {
  EXTRA,
  cookie, parseExtras, setCookies,
} from "./route-shared";

export async function handlePostStage(req: Request, slug: string): Promise<Response | null> {
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
  return null;
}
