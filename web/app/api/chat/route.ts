import { NextResponse } from "next/server";
import { demoTurn } from "@/lib/chat";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as { message?: string; productId?: string; product_id?: string };
  const message = (body.message ?? "").trim() || "öne çıkanlar";
  const productId = body.productId ?? body.product_id ?? null;
  const turn = demoTurn(message, productId);
  const accept = req.headers.get("accept") ?? "";
  if (accept.includes("text/event-stream")) {
    const chunks = [
      `data: ${JSON.stringify({ type: "text", content: turn.text })}\n\n`,
      `data: ${JSON.stringify({ type: "ui", ui: turn.ui })}\n\n`,
      `data: ${JSON.stringify({ type: "suggestions", suggestions: turn.suggestions })}\n\n`,
      `data: ${JSON.stringify({ type: "done" })}\n\n`,
    ];
    return new Response(chunks.join(""), {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }
  return NextResponse.json(turn);
}
