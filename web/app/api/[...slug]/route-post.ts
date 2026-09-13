import { NextResponse } from "next/server";
import { handlePostStore } from "./route-post-store";
import { handlePostOps } from "./route-post-ops";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const slug = (await params).slug.join("/");
  const store = await handlePostStore(req, slug);
  if (store) return store;
  const ops = await handlePostOps(req, slug);
  if (ops) return ops;
  return NextResponse.json({ error: "not found" }, { status: 404 });
}
