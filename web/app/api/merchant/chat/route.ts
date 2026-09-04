import { NextResponse } from "next/server";
import { merchantTurn } from "@/lib/core";
import { buildTurnEvents, streamEvents } from "@/lib/stream-protocol";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as { message?: string };
  const message = (body.message ?? "").trim() || "Bu hafta ciro";
  const turn = merchantTurn(message);
  const accept = req.headers.get("accept") ?? "";

  if (accept.includes("text/event-stream")) {
    const events = buildTurnEvents({
      text: turn.text,
      ui: turn.ui,
      suggestions: turn.suggestions,
      activity: turn.activity,
      activity_steps: turn.activity_steps,
      actions: turn.actions,
    });
    const stream = new ReadableStream({
      async start(controller) {
        const enc = new TextEncoder();
        await streamEvents(events, (chunk) => controller.enqueue(enc.encode(chunk)));
        controller.close();
      },
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }
  return NextResponse.json(turn);
}
