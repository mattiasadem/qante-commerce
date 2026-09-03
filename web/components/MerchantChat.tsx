"use client";

import { useState } from "react";
import type { Alert, Snapshot } from "@/lib/types";
import { money, number } from "@/lib/format";

type Turn = { role: "user" | "assistant"; text: string };

export function MerchantChat({ prefill }: { prefill?: string }) {
  const [input, setInput] = useState(prefill ?? "");
  const [messages, setMessages] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);

  async function submit(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setBusy(true);
    setInput("");
    setMessages((m) => [...m, { role: "user", text: message }]);
    const [snapRes, alertRes] = await Promise.all([
      fetch("/api/merchant/reads/snapshot"),
      fetch("/api/merchant/reads/alerts"),
    ]);
    const snap = (await snapRes.json()) as Snapshot;
    const alertPayload = (await alertRes.json()) as { alerts: Alert[] };
    const names = alertPayload.alerts.slice(0, 3).map((a) => a.product_name).join(", ") || "yok";
    const reply =
      `Son ${snap.period_days} günde ciro ${money(snap.revenue)}, ${number(snap.order_count)} sipariş, ortalama sepet ${money(snap.aov)}. Dikkat: ${names}.`;
    setMessages((m) => [...m, { role: "assistant", text: reply }]);
    setBusy(false);
  }

  return (
    <div className="card" style={{ padding: 0, maxWidth: 720 }}>
      <div className="rail-log" style={{ minHeight: 280 }}>
        {messages.length === 0 ? (
          <div className="bubble">Haftalık özet veya stok için sor. Veri seed kaydından gelir.</div>
        ) : null}
        {messages.map((m, i) => (
          <div key={i} className={`bubble ${m.role === "user" ? "user" : ""}`}>
            {m.text}
          </div>
        ))}
      </div>
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
          placeholder="bu hafta ciro"
          aria-label="Operatör mesajı"
        />
        <button className="btn btn-primary" type="submit" disabled={busy}>
          Gönder
        </button>
      </form>
    </div>
  );
}
