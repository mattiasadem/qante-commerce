"use client";
import Link from "next/link";
import { useState } from "react";
import type { Alert, Issue, Snapshot, StagedChange, WeeklyBar } from "@/lib/core";
import { money, number, percent, suggestRestockQty } from "@/lib/core";

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

function issueAction(kind: string): { action: string; label: string } | null {
  if (kind === "unshipped") return { action: "ship", label: "Kargola" };
  if (kind === "pending_payment") return { action: "mark_paid", label: "Ödeme alındı" };
  if (kind === "return_open") return { action: "close_return", label: "İade kapat" };
  return null;
}

export function AlertList({ alerts, issues }: { alerts: Alert[]; issues: Issue[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [gone, setGone] = useState<Set<string>>(() => new Set());
  const [flash, setFlash] = useState<string | null>(null);
  const [flashHref, setFlashHref] = useState("/merchant/siparisler");

  async function act(orderId: string, action: string) {
    setBusy(orderId);
    setFlash(null);
    setFlashHref("/merchant/siparisler");
    try {
      const res = await fetch("/api/merchant/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, action }),
      });
      const data = await res.json() as { order?: { id: string; status: string }; error?: string };
      if (!res.ok || !data.order) {
        setFlash(data.error ?? "İşlem yapılamadı");
        return;
      }
      setGone((s) => new Set(s).add(orderId));
      setFlash(`${data.order.id} · yerel defter güncellendi`);
    } finally {
      setBusy(null);
    }
  }

  async function stageRestock(a: Alert) {
    const key = `stock:${a.product_id}`;
    setBusy(key);
    setFlash(null);
    setFlashHref("/merchant/bekleyen");
    try {
      const target = suggestRestockQty(a.stock);
      const res = await fetch("/api/merchant/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "stock", product_id: a.product_id, target_qty: target }),
      });
      const data = await res.json() as { change?: StagedChange; error?: string };
      if (!res.ok || !data.change) {
        setFlash(data.error ?? "Kuyruğa yazılamadı");
        return;
      }
      setFlash(`${data.change.product_name} · ${data.change.before.stok} → ${data.change.after.stok} Bekleyen'e eklendi`);
    } finally {
      setBusy(null);
    }
  }

  const visibleIssues = issues.filter((i) => !gone.has(i.order_id));

  return (
    <>
      {flash ? (
        <p className="muted" style={{ marginBottom: 12 }}>
          <span className="banner-demo">{flash}</span>{" "}
          <Link href={flashHref}>{flashHref.includes("bekleyen") ? "Bekleyen'e git" : "Siparişler"}</Link>
        </p>
      ) : (
        <p className="muted" style={{ marginBottom: 12 }}>
          Stok uyarısında Yenile yerel kuyruğa yazar · Onayla ikas'a gitmez
        </p>
      )}
      <div className="list">
        {alerts.map((a) => (
          <div className="list-row" key={`${a.kind}-${a.product_id}`}>
            <div><div>{a.message}</div><div className="faint">{a.product_name}{a.days_cover != null ? ` · ${a.days_cover} gün cover` : ""} · öneri {suggestRestockQty(a.stock)}</div></div>
            <span className={`tag ${a.kind === "out_of_stock" ? "danger" : "warn"}`}>{a.kind === "out_of_stock" ? "tükendi" : a.kind === "low_stock" ? "düşük stok" : "yavaş"}</span>
            <button className="btn btn-primary" type="button" disabled={busy === `stock:${a.product_id}`} onClick={() => void stageRestock(a)}>
              {busy === `stock:${a.product_id}` ? "…" : "Yenile"}
            </button>
            <Link className="btn" href={`/merchant/sohbet?q=${encodeURIComponent(a.product_name + " stok yenile")}`}>Sor</Link>
          </div>
        ))}
        {visibleIssues.map((i) => {
          const cta = issueAction(i.kind);
          return (
            <div className="list-row" key={`${i.kind}-${i.order_id}`}>
              <div><div>{i.message}</div><div className="faint">{money(i.total)}</div></div>
              <span className="tag danger">{i.kind === "unshipped" ? "kargolanmadı" : i.kind === "pending_payment" ? "ödeme" : "iade"}</span>
              {cta ? (
                <button className="btn btn-primary" type="button" disabled={busy === i.order_id} onClick={() => void act(i.order_id, cta.action)}>
                  {busy === i.order_id ? "…" : cta.label}
                </button>
              ) : null}
              <Link className="btn" href={`/merchant/sohbet?q=${encodeURIComponent(i.order_id)}`}>Sor</Link>
            </div>
          );
        })}
        {alerts.length === 0 && visibleIssues.length === 0 ? <div className="list-row"><span className="muted">Dikkat gerektiren kayıt yok.</span></div> : null}
      </div>
    </>
  );
}
