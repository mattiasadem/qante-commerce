"use client";

import type { GenDigestPayload } from "@/lib/stream-protocol";

const KIND_TR: Record<string, { label: string; tone: string }> = {
  low_stock: { label: "düşük stok", tone: "warn" },
  out_of_stock: { label: "tükendi", tone: "danger" },
  slow_mover: { label: "yavaş", tone: "warn" },
  order_issue: { label: "sipariş", tone: "danger" },
  metric: { label: "metrik", tone: "ok" },
  pending_change: { label: "onay bekliyor", tone: "accent" },
  note: { label: "not", tone: "" },
};

export function DigestCard({
  payload,
  onAsk,
}: {
  payload: GenDigestPayload;
  onAsk?: (text: string) => void;
}) {
  const items = payload.items ?? [];
  return (
    <section className="gen-card gen-digest-card ac-reveal" data-component="digest">
      <div className="gen-card-head">
        <h3 className="gen-title">{payload.title ?? "Dikkat"}</h3>
        <span className="tag accent">{items.length}</span>
      </div>
      <ul className="gen-digest">
        {items.map((item, i) => {
          const meta = KIND_TR[item.kind] ?? KIND_TR.note;
          return (
            <li key={`${item.ref_id ?? item.headline}-${i}`}>
              <div>
                <div>{item.headline}</div>
                {item.why ? <div className="faint">{item.why}</div> : null}
              </div>
              <span className={`tag ${meta.tone}`}>{meta.label}</span>
              {onAsk && item.kind !== "pending_change" ? (
                <button className="btn" type="button" onClick={() => onAsk(item.headline)}>
                  Sor
                </button>
              ) : null}
              {item.kind === "pending_change" ? (
                <a className="btn" href="/merchant/bekleyen">Bekleyen</a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
