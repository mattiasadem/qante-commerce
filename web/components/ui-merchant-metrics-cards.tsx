"use client";
import type { Snapshot, WeeklyBar } from "@/lib/core";
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
      <div className="section-label">Haftalık ciro</div>
      <div className="bars">
        {bars.map((b, i) => <div key={i} className={`bar ${i === bars.length - 1 ? "last" : ""}`} style={{ height: `${Math.max(6, Math.round((b.value / max) * 100))}%` }} title={money(b.value)} />)}
      </div>
      <div className="bar-labels">{bars.map((b, i) => <span key={i}>{b.label}</span>)}</div>
    </div>
  );
}
