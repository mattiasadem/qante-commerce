"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ChatAction, StagedChange } from "@/lib/core";
import { ActivityLine, GenerativeBlock } from "@/components/generative";
import { useAgentStream } from "@/lib/use-agent-stream";
import { Suggestions } from "web-shared";
import { MERCHANT_ACTIVITY_DEFAULT } from "@/lib/tool-copy-tr";

const MERCHANT_FALLBACK = MERCHANT_ACTIVITY_DEFAULT[0];

const STARTERS = ["Bu hafta ciro", "Stoğu bitmeye yakın", "Bekleyen değişiklikler"];

export function MerchantChat({ prefill }: { prefill?: string }) {
  const [input, setInput] = useState(prefill ?? "");
  const { messages, busy, activity, submit } = useAgentStream({ endpoint: "/api/merchant/chat" });
  const [stageBusy, setStageBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  async function runAction(a: ChatAction) {
    const key = a.kind === "order"
      ? `order:${a.order_id}:${a.order_action}`
      : `${a.kind}:${a.product_id}`;
    setStageBusy(key);
    setFlash(null);
    try {
      if (a.kind === "order") {
        if (!a.order_id || !a.order_action) {
          setFlash("Sipariş aksiyonu eksik");
          return;
        }
        const res = await fetch("/api/merchant/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: a.order_id, action: a.order_action }),
        });
        const data = await res.json() as { order?: { id: string; status: string }; error?: string };
        if (!res.ok || !data.order) {
          setFlash(data.error ?? "Sipariş yazılamadı");
          return;
        }
        setFlash(`${data.order.id} · ${data.order.status} · yerel defter · ikas'a gitmedi`);
        return;
      }
      if (!a.product_id) {
        setFlash("Ürün eksik");
        return;
      }
      const body: Record<string, string | number> = { kind: a.kind, product_id: a.product_id };
      if (a.target_qty != null) body.target_qty = a.target_qty;
      if (a.target_price != null) body.target_price = a.target_price;
      const res = await fetch("/api/merchant/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json() as { change?: StagedChange; error?: string };
      if (!res.ok || !data.change) {
        setFlash(data.error ?? "Kuyruğa yazılamadı");
        return;
      }
      const c = data.change;
      if (c.kind === "stock") setFlash(`${c.product_name} · ${c.before.stok} → ${c.after.stok} Bekleyen'e eklendi`);
      else if (c.kind === "price") setFlash(`${c.product_name} · ${c.before.fiyat} → ${c.after.fiyat} Bekleyen'e eklendi`);
      else setFlash(`${c.product_name} · liste → Bekleyen`);
    } finally {
      setStageBusy(null);
    }
  }

  const boot = useRef(false);
  useEffect(() => {
    if (prefill && !boot.current) {
      boot.current = true;
      void submit(prefill);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefill]);

  return (
    <div className="card" style={{ padding: 0, maxWidth: 760, overflow: "hidden" }} data-component="MerchantChat">
      {flash ? (
        <p className="muted" style={{ margin: "12px 16px 0" }}>
          <span className="banner-demo">{flash}</span>{" "}
          <Link href={flash.includes("yerel defter") && !flash.includes("Bekleyen") ? "/merchant/siparisler" : "/merchant/bekleyen"}>
            {flash.includes("yerel defter") && !flash.includes("Bekleyen") ? "Siparişler" : "Bekleyen'e git"}
          </Link>
        </p>
      ) : (
        <p className="muted" style={{ margin: "12px 16px 0" }}>
          Digest + change_preview · CTAlar yerel Bekleyen veya Siparişler defterine yazar · ikas&apos;a gitmez
        </p>
      )}
      <div className="rail-log" style={{ minHeight: 320 }}>
        {messages.length === 0 ? (
          <>
            <div className="turn">Haftalık özet, stok veya bekleyen. Kartlar akışla gelir.</div>
            <Suggestions suggestions={STARTERS} onPick={(s) => void submit(s)} disabled={busy} />
          </>
        ) : null}
        {messages.map((m, i) => (
          <div key={i}>
            {m.role === "user" ? (
              <div className="turn user">{m.text}</div>
            ) : (
              <>
                {m.text ? <div className="turn">{m.text}</div> : null}
                {m.slots.map((slot) => (
                  <div key={slot.stream_id} style={{ marginTop: 10 }}>
                    <GenerativeBlock slot={slot} onAsk={(t) => void submit(t)} />
                  </div>
                ))}
                {m.pending ? <ActivityLine label={activity || MERCHANT_FALLBACK} /> : null}
                {(m.actions as ChatAction[] | undefined)?.length ? (
                  <div className="actions" style={{ marginTop: 10, flexWrap: "wrap", gap: 8 }}>
                    {(m.actions as ChatAction[]).map((a) => {
                      const key = a.kind === "order"
                        ? `order:${a.order_id}:${a.order_action}`
                        : `${a.kind}:${a.product_id}`;
                      return (
                        <button
                          key={key + a.label}
                          className="btn btn-primary"
                          type="button"
                          disabled={stageBusy === key || busy}
                          onClick={() => void runAction(a)}
                        >
                          {stageBusy === key ? "…" : a.label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
                {!m.pending && m.suggestions?.length ? (
                  <Suggestions suggestions={m.suggestions.slice(0, 3)} onPick={(s) => void submit(s)} disabled={busy} />
                ) : null}
              </>
            )}
          </div>
        ))}
      </div>
      {busy && !messages.some((m) => m.role === "assistant" && m.pending) ? (
        <ActivityLine label={activity || MERCHANT_FALLBACK} />
      ) : null}
      <form className="composer" onSubmit={(e) => { e.preventDefault(); void submit(input); setInput(""); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="bu hafta ciro" aria-label="Operatör mesajı" />
        <button className="btn btn-primary" type="submit" disabled={busy}>Gönder</button>
      </form>
    </div>
  );
}
