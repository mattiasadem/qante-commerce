import type { Snapshot } from "@/lib/types";
import { money, number, percent } from "@/lib/format";

function Delta({ value }: { value: number }) {
  const cls = value > 0 ? "delta up" : value < 0 ? "delta down" : "delta";
  return <div className={cls}>{percent(value)} önceki 30 gün</div>;
}

export function MetricCards({ snap }: { snap: Snapshot }) {
  return (
    <div className="metrics">
      <div className="metric">
        <div className="label">Ciro</div>
        <div className="value">{money(snap.revenue)}</div>
        <Delta value={snap.revenue_delta_pct} />
      </div>
      <div className="metric">
        <div className="label">Sipariş</div>
        <div className="value">{number(snap.order_count)}</div>
        <Delta value={snap.order_delta_pct} />
      </div>
      <div className="metric">
        <div className="label">Ort. sepet</div>
        <div className="value">{money(snap.aov)}</div>
        <Delta value={snap.aov_delta_pct} />
      </div>
      <div className="metric">
        <div className="label">İptal</div>
        <div className="value">{percent(snap.cancel_rate * 100)}</div>
        <div className="delta">son {snap.period_days} gün</div>
      </div>
    </div>
  );
}
