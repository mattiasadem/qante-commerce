"use client";
import Link from "next/link";
import type { Alert, Issue, Snapshot, WeeklyBar } from "@/lib/core";
import { money, number, percent } from "@/lib/core";

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
