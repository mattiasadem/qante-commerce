"use client";

import { useState } from "react";
import Link from "next/link";
import type { ChatResponse, Product } from "@/lib/types";
import { money } from "@/lib/format";
import { useCart } from "@/lib/cart-client";

type Msg = { role: "user" | "assistant"; text: string; products?: Product[]; suggestions?: string[] };

const STARTERS = ["Keten bakıyorum", "Eve bir vazo", "Yün atkı var mı"];

async function send(message: string, productId?: string): Promise<ChatResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, productId }),
  });
  return (await res.json()) as ChatResponse;
}

function Transcript({
  messages,
  onChip,
}: {
  messages: Msg[];
  onChip: (text: string) => void;
}) {
  const { add } = useCart();
  return (
    <div className="rail-log">
      {messages.length === 0 ? (
        <>
          <div className="bubble">Merhaba. Qante Asistan. Ne arıyorsun.</div>
          <div className="chips">
            {STARTERS.map((s) => (
              <button key={s} className="chip" type="button" onClick={() => onChip(s)}>
                {s}
              </button>
            ))}
          </div>
        </>
      ) : null}
      {messages.map((m, i) => (
        <div key={i}>
          <div className={`bubble ${m.role === "user" ? "user" : ""}`}>{m.text}</div>
          {m.products && m.products.length > 0 ? (
            <div className="mini-products" style={{ marginTop: 8 }}>
              {m.products.map((p) => (
                <div key={p.id} className="mini-product">
                  <Link href={`/urun/${p.id}`}>
                    <img src={p.image} alt={p.name} />
                  </Link>
                  <div>
                    <Link href={`/urun/${p.id}`}>{p.name}</Link>
                    <div className="faint">{money(p.price)}</div>
                  </div>
                  <button className="chip" type="button" disabled={p.stock <= 0} onClick={() => void add(p.id)}>
                    Ekle
                  </button>
                </div>
              ))}
            </div>
          ) : null}
          {m.suggestions ? (
            <div className="chips" style={{ marginTop: 8 }}>
              {m.suggestions.slice(0, 3).map((s) => (
                <button key={s} className="chip" type="button" onClick={() => onChip(s)}>
                  {s}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function AssistantPane({
  productId,
  prefill,
}: {
  productId?: string;
  prefill?: string;
}) {
  const [input, setInput] = useState(prefill ?? "");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);

  async function submit(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setBusy(true);
    setInput("");
    setMessages((m) => [...m, { role: "user", text: message }]);
    try {
      const turn = await send(message, productId);
      const products = turn.ui.find((u) => u.type === "present_products")?.products ?? [];
      setMessages((m) => [
        ...m,
        { role: "assistant", text: turn.text, products, suggestions: turn.suggestions },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="rail-head">Qante Asistan</div>
      <Transcript messages={messages} onChip={(t) => void submit(t)} />
      {busy ? <div className="faint" style={{ padding: "0 18px 8px" }}>katalogda bakıyorum</div> : null}
      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          void submit(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ne arıyorsun"
          aria-label="Asistan mesajı"
        />
        <button className="btn btn-primary" type="submit" disabled={busy}>
          Gönder
        </button>
      </form>
    </>
  );
}

export function AssistantRail({ productId }: { productId?: string }) {
  return (
    <aside className="rail" role="complementary" aria-label="Qante Asistan">
      <AssistantPane productId={productId} />
    </aside>
  );
}

export function AssistantSheet({ productId }: { productId?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="sheet-bar">
        <button className="btn btn-primary" type="button" style={{ width: "100%" }} onClick={() => setOpen(true)}>
          Asistana sor
        </button>
      </div>
      {open ? (
        <div className="sheet" role="dialog" aria-label="Qante Asistan">
          <div className="drawer-head">
            <strong>Qante Asistan</strong>
            <button className="icon-btn" type="button" onClick={() => setOpen(false)} aria-label="Kapat">
              Kapat
            </button>
          </div>
          <AssistantPane productId={productId} />
        </div>
      ) : null}
    </>
  );
}
