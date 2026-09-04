"use client";

import type { GenMetricsPayload } from "@/lib/stream-protocol";

export function MetricsCard({ payload, partial }: { payload: GenMetricsPayload; partial?: boolean }) {
  const rows = payload.rows ?? [];
  return (
    <section className="gen-card ac-reveal" data-component="metrics">
      {payload.title ? <h3 className="gen-title">{payload.title}</h3> : null}
      <div className="metrics-inline">
        {rows.map((r) => (
          <div key={r.label}>
            <span className="muted">{r.label}</span>
            <strong>{r.value}{r.hint ? <span className="faint"> · {r.hint}</span> : null}</strong>
          </div>
        ))}
        {partial ? <div className="ac-skeleton" style={{ height: 14, width: "50%", borderRadius: 6 }} /> : null}
      </div>
    </section>
  );
}
