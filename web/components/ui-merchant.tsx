"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Alert, ChatResponse, Issue, Product, Snapshot, StagedChange, WeeklyBar } from "@/lib/core";
import { KIND_LABEL, STATUS_LABEL, money, number, percent, qualityScore, shortDate } from "@/lib/core";
import { Logo } from "@/components/ui-shell";

function Delta({ v }: { v: number }) {
  return <div className={v > 0 ? "delta up" : v < 0 ? "delta down" : "delta"}>{percent(v)} önceki 30 gün</div>;
}

export function MetricCards({ snap }: { snap: Snapshot }) {
  return (
    <div className="metrics">
      <div className="metric"><div className="label">Ciro</div><div className="value">{money(snap.revenue)}</div><Delta v={snap.revenue_delta_pct} /></div>
      <div className="metric"><div className="label">Sipariş</div><div className="value">{number(snap.order_count)}</div><Delta v={snap.order_delta_pct} /></div>
      <div className="metric"><div className="label">Ort. sepet</div><div className="value">{money(snap.aov)}</div><Delta v={snap.aov_delta_pct} /></div>
      <div className="metric"><div className="label">İptal</div><div className="value">{percent(snap.cancel_rate * 100)}</div><div className="delta">son {snap.period_days} gün</div></div>
    </div>
  );
}

export function MiniBars({ bars }: { bars: WeeklyBar[] }) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  return (
    <div className="bars-card">
      <div className="faint" style={{ marginBottom: 10 }}>Haftalık ciro</div>
      <div className="bars">
        {bars.map((b, i) => <div key={i} className={`bar ${i === bars.length - 1 ? "last" : ""}`} style={{ height: `${Math.max(6, Math.round((b.value / max) * 100))}%` }} title={money(b.value)} />)}
      </div>
      <div className="bar-labels">{bars.map((b, i) => <span key={i}>{b.label}</span>)}</div>
    </div>
  );
}

export function AlertList({ alerts, issues }: { alerts: Alert[]; issues: Issue[] }) {
  return (
    <div className="list">
      {alerts.map((a) => (
        <div className="list-row" key={`${a.kind}-${a.product_id}`}>
          <div><div>{a.message}</div><div className="faint">{a.product_name}{a.days_cover != null ? ` · ${a.days_cover} gün cover` : ""}</div></div>
          <span className={`tag ${a.kind === "out_of_stock" ? "danger" : "warn"}`}>{a.kind === "out_of_stock" ? "tükendi" : a.kind === "low_stock" ? "düşük stok" : "yavaş"}</span>
          <Link className="btn" href={`/merchant/sohbet?q=${encodeURIComponent(a.product_name)}`}>Sor</Link>
        </div>
      ))}
      {issues.map((i) => (
        <div className="list-row" key={`${i.kind}-${i.order_id}`}>
          <div><div>{i.message}</div><div className="faint">{money(i.total)}</div></div>
          <span className="tag danger">{i.kind === "unshipped" ? "kargolanmadı" : i.kind === "pending_payment" ? "ödeme" : "iade"}</span>
          <Link className="btn" href={`/merchant/sohbet?q=${encodeURIComponent(i.order_id)}`}>Sor</Link>
        </div>
      ))}
      {alerts.length === 0 && issues.length === 0 ? <div className="list-row"><span className="muted">Dikkat gerektiren kayıt yok.</span></div> : null}
    </div>
  );
}

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

export function StagedQueue({ initial }: { initial: StagedChange[] }) {
  const [items, setItems] = useState(initial);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => {
    void fetch("/api/merchant/staged", { cache: "no-store" }).then((r) => r.json()).then((d: { changes?: StagedChange[] }) => {
      if (d.changes) setItems(d.changes);
    });
  }, []);
  async function mutate(id: string, action: "approve" | "discard", note?: string) {
    setBusy(id);
    try {
      const res = await fetch("/api/merchant/changes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action, reason: note }) });
      const data = await res.json() as { change?: StagedChange };
      if (data.change) setItems((xs) => xs.map((x) => x.id === id ? data.change! : x));
    } finally { setBusy(null); }
  }
  function approve(id: string) { void mutate(id, "approve"); }
  function reject() {
    if (!rejectId || !reason.trim()) return;
    const id = rejectId;
    const note = reason.trim();
    setRejectId(null);
    setReason("");
    void mutate(id, "discard", note);
  }
  return (
    <>
      <p className="muted" style={{ marginTop: -8, marginBottom: 16 }}>
        <span className="banner-demo">DEMO kuyruk · Onayla yerel deftere yazar, ikas’a gitmez</span>
      </p>
      {items.filter((c) => c.status === "staged").length === 0 ? (
        <div className="empty"><div className="mark" /><h3>Bekleyen yok</h3><p>Onay ve redler geçmişte. Canlı ikas yazılmadı.</p></div>
      ) : null}
      {items.filter((c) => c.status === "staged").map((c) => (
        <article className="change" key={c.id}>
          <div className="change-head">
            <div>
              <strong>{KIND_LABEL[c.kind]}</strong>
              <div className="faint">{c.product_name} · {c.staged_by} · {shortDate(c.created_at)} · {c.variant_count} varyant</div>
            </div>
            <span className={`tag ${c.status === "staged" ? "accent" : c.status === "discarded" ? "danger" : "ok"}`}>
              {c.status === "staged" ? "bekliyor" : c.status === "discarded" ? "reddedildi" : "uygulandı"}
            </span>
          </div>
          <div className="diff">
            <div className="col"><div className="k">Önce</div>{Object.entries(c.before).map(([k, v]) => <div key={k}>{k}: {v}</div>)}</div>
            <div className="col"><div className="k">Sonra</div>{Object.entries(c.after).map(([k, v]) => <div key={k}>{k}: {v}</div>)}</div>
          </div>
          <p className="reason">{c.reason}</p>
          <div className="chips">
            {c.guardrails.map((g) => <span key={g.id} className={`tag ${g.ok ? "ok" : "danger"}`}>{g.label} {g.ok ? "uygun" : "cap dışı"}</span>)}
          </div>
          {c.status === "staged" ? (
            <div className="actions">
              <button className="btn btn-primary" type="button" disabled={busy === c.id} onClick={() => approve(c.id)}>Onayla</button>
              <button className="btn" type="button" onClick={() => { setRejectId(c.id); setReason(""); }}>Reddet</button>
            </div>
          ) : null}
        </article>
      ))}
      {items.some((c) => c.status !== "staged") ? <h2 style={{ marginTop: 28 }}>Geçmiş</h2> : null}
      {items.filter((c) => c.status !== "staged").map((c) => (
        <article className="change" key={`h-${c.id}`}>
          <div className="change-head">
            <div>
              <strong>{KIND_LABEL[c.kind]}</strong>
              <div className="faint">{c.product_name} · {c.status === "applied" ? "yerel deftere yazıldı · ikas simüle" : "reddedildi"}{c.decision_note ? ` · ${c.decision_note}` : ""}</div>
            </div>
            <span className={`tag ${c.status === "discarded" ? "danger" : "ok"}`}>{c.status === "discarded" ? "reddedildi" : "uygulandı"}</span>
          </div>
          <div className="diff">
            <div className="col"><div className="k">Önce</div>{Object.entries(c.before).map(([k, v]) => <div key={k}>{k}: {v}</div>)}</div>
            <div className="col"><div className="k">Sonra</div>{Object.entries(c.after).map(([k, v]) => <div key={k}>{k}: {v}</div>)}</div>
          </div>
        </article>
      ))}
      {rejectId ? (
        <div className="dialog">
          <div className="box">
            <h2>Red nedeni</h2>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="neden reddedildi" aria-label="Red nedeni" />
            <div className="actions">
              <button className="btn btn-primary" type="button" disabled={!reason.trim()} onClick={reject}>Reddet</button>
              <button className="btn" type="button" onClick={() => setRejectId(null)}>Vazgeç</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function CatalogTable({ products }: { products: Product[] }) {
  return (
    <div className="table-wrap">
      <table className="data">
        <thead><tr><th></th><th>Ürün</th><th>SKU</th><th>Stok</th><th>Fiyat</th><th>Kalite</th><th></th></tr></thead>
        <tbody>
          {products.map((p) => {
            const q = qualityScore(p);
            return (
              <tr key={p.id}>
                <td><img src={p.image} alt="" width={36} height={45} style={{ width: 36, height: 45, objectFit: "cover", borderRadius: 6 }} /></td>
                <td>{p.name}<div className="faint">{p.category}</div></td>
                <td className="faint">{p.sku}</td>
                <td>{p.stock}</td>
                <td>{money(p.price)}</td>
                <td><span className="score">{q}<i><b style={{ width: `${q}%` }} /></i></span></td>
                <td><Link className="btn" href={`/merchant/sohbet?q=${encodeURIComponent(p.name + " başlığını düzelt")}`}>Düzelt</Link></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function StockView({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="list">
      {alerts.map((a) => (
        <div className="list-row" key={`${a.kind}-${a.product_id}`}>
          <div>
            <div>{a.product_name}</div>
            <div className="faint">stok {a.stock} · cover {a.days_cover ?? "—"} gün{a.days_without_sale != null ? ` · ${a.days_without_sale} gündür satış yok` : ""}</div>
          </div>
          <span className={`tag ${a.kind === "out_of_stock" ? "danger" : "warn"}`}>{a.kind === "out_of_stock" ? "tükendi" : a.kind === "low_stock" ? "düşük" : "yavaş"}</span>
          <Link className="btn" href={`/merchant/sohbet?q=${encodeURIComponent(a.product_name + " stok yenile")}`}>Yenile</Link>
        </div>
      ))}
      {alerts.length === 0 ? <div className="list-row"><span className="muted">Uyarı yok.</span></div> : null}
    </div>
  );
}

export function OrdersView({ issues }: { issues: Issue[] }) {
  return (
    <div className="list">
      {issues.map((i) => (
        <div className="list-row" key={`${i.kind}-${i.order_id}`}>
          <div>
            <div>{i.order_id}</div>
            <div className="faint">{i.message} · {money(i.total)}</div>
          </div>
          <span className="tag danger">{STATUS_LABEL[i.status] ?? i.status}</span>
          <Link className="btn" href={`/merchant/sohbet?q=${encodeURIComponent(i.order_id)}`}>Sor</Link>
        </div>
      ))}
      {issues.length === 0 ? (
        <div className="empty"><Logo size={32} /><h3>Açık konu yok</h3><p>Seed siparişlerinde bekleyen iade veya kargo gecikmesi yok.</p></div>
      ) : null}
    </div>
  );
}
