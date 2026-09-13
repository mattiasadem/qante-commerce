import { NextResponse } from "next/server";
import { handlePostChatCart } from "./route-post-chatcart";
import { handlePostChanges } from "./route-post-changes";
import { handlePostStage } from "./route-post-stage";
import { handlePostOrders } from "./route-post-orders";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const slug = (await params).slug.join("/");
  const a = await handlePostChatCart(req, slug);
  if (a) return a;
  const b = await handlePostChanges(req, slug);
  if (b) return b;
  const c = await handlePostStage(req, slug);
  if (c) return c;
  const d = await handlePostOrders(req, slug);
  if (d) return d;
  return NextResponse.json({ error: "not found" }, { status: 404 });
}
