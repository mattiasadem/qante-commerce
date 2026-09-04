"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ChatAction, ChatResponse, StagedChange } from "@/lib/core";

type Msg = {
  role: "user" | "assistant";
  text: string;
  ui?: ChatResponse["ui"];
  suggestions?: string[];
  actions?: ChatAction[];
};

const STARTERS = ["Bu hafta ciro", "Stoğu bitmeye yakın", "Açık siparişler"];

export function MerchantChat({ prefill }: { prefill?: string }) {
  const [input, setInput] = useState(prefill ?? "");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [activity, setActivity] = useState("");
  const [stageBusy, setStageBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  async function submit(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setBusy(true);
    setActivity("özet rakamlara bakıyorum");
    setInput("");
    setFlash(null);
    setMessages((m) => [...m, { role: "user", text: message }]);
    try {
      const turn = (await (await fetch("/api/merchant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })).json()) as ChatResponse;
      setActivity(turn.activity);
      await new Promise((r) => setTimeout(r, 280));
      setMessages((m) => [...m, {
        role: "assistant",
        text: turn.text,
        ui: turn.ui,
        suggestions: turn.suggestions?.slice(0, 3),
        actions: turn.actions,
      }]);
    } finally {
      setBusy(false);
      setActivity("");
    }
  }

  async function runAction(a: ChatAction) {
    const key = `${a.kind}:${a.product_id}`;
    setStageBusy(key);
    setFlash(null);
    try {
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
  }, [prefill]);

  return (
    <div className="card" style={{ padding: 0, maxWidth: 760, overflow: "hidden" }}>
      {flash ? (
        <p className="muted" style={{ margin: "12px 16px 0" }}>
          <span className="banner-demo">{flash}</span>{" "}
          <Link href="/merchant/bekleyen">Bekleyen'e git</Link>
        </p>
      ) : (
        <p className="muted" style={{ margin: "12px 16px 0" }}>
          Sohbet CTAları yerel Bekleyen kuyruğuna yazar · Onayla ikas'a gitmez
        </p>
      )}
      <div className="rail-log" style={{ minHeight: 320 }}>
        {messages.length === 0 ? (
          <>
            <div className="turn">Haftalık özet, stok veya açık sipariş. Veri seed kaydından gelir.</div>
            <div className="chips" style={{ marginTop: 10 }}>
              {STARTERS.map((s) => (
                <button key={s} className="chip" type="button" onClick={() => void submit(s)}>{s}</button>
              ))}
            </div>
          </>
        ) : null}
        {messages.map((m, i) => (
          <div key={i}>
            <div className={`turn ${m.role === "user" ? "user" : ""}`}>{m.text}</div>
            {m.ui?.map((b, k) => (
              <div key={k} style={{ marginTop: 10 }}>
                {b.rows ? (
                  <div className="metrics-inline">
                    {b.rows.map((r) => (
                      <div key={r.label}><span className="muted">{r.label}</span><strong>{r.value}</strong></div>
                    ))}
                  </div>
                ) : null}
                {b.table ? (
                  <div className="table-wrap" style={{ marginTop: 8 }}>
                    <table className="data">
                      <thead><tr>{(b.columns ?? []).map((c) => <th key={c}>{c}</th>)}</tr></thead>
                      <tbody>{b.table.map((row, ri) => <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{cell}</td>)}</tr>)}</tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            ))}
            {m.actions?.length ? (
              <div className="actions" style={{ marginTop: 10, flexWrap: "wrap", gap: 8 }}>
                {m.actions.map((a) => {
                  const key = `${a.kind}:${a.product_id}`;
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
            {m.suggestions?.length ? (
              <div className="chips" style={{ marginTop: 8 }}>
                {m.suggestions.map((s) => (
                  <button key={s} className="chip" type="button" disabled={busy} onClick={() => void submit(s)}>{s}</button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {busy ? <div className="activity">{activity}</div> : null}
      <form className="composer" onSubmit={(e) => { e.preventDefault(); void submit(input); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="bu hafta ciro" aria-label="Operatör mesajı" />
        <button className="btn btn-primary" type="submit" disabled={busy}>Gönder</button>
      </form>
    </div>
  );
}
