import Link from "next/link";
import type { Alert, Issue } from "@/lib/types";

export function AlertList({ alerts, issues }: { alerts: Alert[]; issues: Issue[] }) {
  return (
    <div className="list">
      {alerts.map((a) => (
        <div className="list-row" key={`${a.kind}-${a.product_id}`}>
          <div>
            <div>{a.message}</div>
            <div className="faint">{a.product_name}</div>
          </div>
          <span className={`tag ${a.kind === "out_of_stock" ? "danger" : "warn"}`}>{a.kind}</span>
          <Link className="btn" href={`/merchant/sohbet?q=${encodeURIComponent(a.product_name)}`}>
            Sor
          </Link>
        </div>
      ))}
      {issues.map((i) => (
        <div className="list-row" key={`${i.kind}-${i.order_id}`}>
          <div>
            <div>{i.message}</div>
          </div>
          <span className="tag danger">{i.kind}</span>
          <Link className="btn" href={`/merchant/sohbet?q=${encodeURIComponent(i.order_id)}`}>
            Sor
          </Link>
        </div>
      ))}
      {alerts.length === 0 && issues.length === 0 ? (
        <div className="list-row">
          <span className="muted">Dikkat gerektiren kayıt yok.</span>
        </div>
      ) : null}
    </div>
  );
}
