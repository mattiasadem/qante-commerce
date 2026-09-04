"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAsk, useCart } from "@/components/ui-shell";
import { Suggestions } from "web-shared";
import { ActivityLine, GenerativeBlock } from "@/components/generative";
import { useAgentStream } from "@/lib/use-agent-stream";

const STARTERS = ["Keten bakıyorum", "Eve bir vazo", "Yün atkı var mı", "Bunu sepete ekle"];

export function AssistantPane({ productId, prefill }: { productId?: string; prefill?: string }) {
  const { ask } = useAsk();
  const { applyCart } = useCart();
  const onCartUpdate = useCallback((cart: Parameters<typeof applyCart>[0]) => applyCart(cart), [applyCart]);
  const { messages, busy, activity, submit } = useAgentStream({ endpoint: "/api/chat", onCartUpdate });
  const [input, setInput] = useState(prefill ?? "");
  const seen = useRef(0);

  useEffect(() => {
    if (ask && ask.n !== seen.current) {
      seen.current = ask.n;
      void submit(ask.message, ask.productId ?? productId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ask]);

  return (
    <>
      <div className="rail-head"><span>Qante Asistan</span><span className="faint">generative</span></div>
      <div className="rail-log">
        {messages.length === 0 ? (
          <>
            <div className="turn">Merhaba. Ne arıyorsun — keten, ev, yün. Kartlar akışla gelir.</div>
            <Suggestions suggestions={STARTERS} onPick={(s) => void submit(s, productId)} disabled={busy} />
          </>
        ) : null}
        {messages.map((m, i) => (
          <div key={i} data-turn={i}>
            {m.role === "user" ? (
              <div className="turn user">{m.text}</div>
            ) : (
              <>
                {m.text ? <div className="turn">{m.text}</div> : null}
                {m.slots.map((slot) => (
                  <GenerativeBlock key={slot.stream_id} slot={slot} onAsk={(t) => void submit(t, productId)} />
                ))}
                {m.pending ? <ActivityLine label={activity || "Ürünleri arıyorum…"} /> : null}
                {!m.pending && m.suggestions?.length ? (
                  <Suggestions suggestions={m.suggestions.slice(0, 3)} onPick={(s) => void submit(s, productId)} disabled={busy} />
                ) : null}
              </>
            )}
          </div>
        ))}
      </div>
      {busy && !messages.some((m) => m.role === "assistant" && m.pending) ? (
        <ActivityLine label={activity || "Ürünleri arıyorum…"} />
      ) : null}
      <form className="composer" onSubmit={(e) => { e.preventDefault(); void submit(input, productId); setInput(""); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="ne arıyorsun" aria-label="Asistan" />
        <button className="btn btn-primary" type="submit" disabled={busy}>Gönder</button>
      </form>
    </>
  );
}

export function AssistantRail({ productId }: { productId?: string }) {
  return (
    <aside className="rail" role="complementary" aria-label="Qante Asistan" data-component="AssistantRail">
      <AssistantPane productId={productId} />
    </aside>
  );
}

export function AssistantSheet({ productId }: { productId?: string }) {
  const { sheetOpen, setSheetOpen } = useAsk();
  if (!sheetOpen) return null;
  return (
    <div className="sheet" role="dialog" aria-label="Qante Asistan">
      <div className="drawer-head">
        <strong>Qante Asistan</strong>
        <button className="icon-btn" type="button" onClick={() => setSheetOpen(false)} aria-label="Kapat">Kapat</button>
      </div>
      <AssistantPane productId={productId} />
    </div>
  );
}
