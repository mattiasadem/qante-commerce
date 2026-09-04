"use client";
import { useEffect, useRef, useState } from "react";
import type { ChatResponse } from "@/lib/core";

type Msg = { role: "user" | "assistant"; text: string; ui?: ChatResponse["ui"] };
export function MerchantChat({ prefill }: { prefill?: string }) {
  const [input, setInput] = useState(prefill ?? "");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [activity, setActivity] = useState("");
  async function submit(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setBusy(true);
    setActivity("özet rakamlara bakıyorum");
    setInput("");
    setMessages((m) => [...m, { role: "user", text: message }]);
    try {
      const turn = (await (await fetch("/api/merchant/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) })).json()) as ChatResponse;
      setActivity(turn.activity);
      await new Promise((r) => setTimeout(r, 280));
      setMessages((m) => [...m, { role: "assistant", text: turn.text, ui: turn.ui }]);
    } finally { setBusy(false); setActivity(""); }
  }
  const boot = useRef(false);
  useEffect(() => {
    if (prefill && !boot.current) { boot.current = true; void submit(prefill); }
  }, [prefill]);
  return (
    <div className="card" style={{ padding: 0, maxWidth: 760, overflow: "hidden" }}>
      <div className="rail-log" style={{ minHeight: 320 }}>
        {messages.length === 0 ? <div className="turn">Haftalık özet, stok veya açık sipariş. Veri seed kaydından gelir.</div> : null}
        {messages.map((m, i) => (
          <div key={i}>
            <div className={`turn ${m.role === "user" ? "user" : ""}`}>{m.text}</div>
            {m.ui?.map((b, k) => (
              <div key={k} style={{ marginTop: 10 }}>
                {b.rows ? <div className="metrics-inline">{b.rows.map((r) => <div key={r.label}><span className="muted">{r.label}</span><strong>{r.value}</strong></div>)}</div> : null}
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
