"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Issue, Order } from "@/lib/core";
import { STATUS_LABEL, getProduct, money, shortDate } from "@/lib/core";
import { Logo } from "@/components/ui-shell";

const ORDER_FILTERS: { id: string; label: string; match: (o: Order, open: Set<string>) => boolean }[] = [
  { id: "all", label: "Tümü", match: () => true },
  { id: "open", label: "Açık", match: (o, open) => open.has(o.id) },
  { id: "paid", label: "Ödeme alındı", match: (o) => o.status === "paid" },
  { id: "pending_payment", label: "Ödeme bekliyor", match: (o) => o.status === "pending_payment" },
  { id: "return_requested", label: "İade", match: (o) => o.status === "return_requested" },
  { id: "shipped", label: "Kargoda", match: (o) => o.status === "shipped" },
  { id: "fulfilled", label: "Teslim", match: (o) => o.status === "fulfilled" },
  { id: "cancelled", label: "İptal", match: (o) => o.status === "cancelled" },
];

function statusTone(status: string, isOpen: boolean) {
  if (isOpen || status === "return_requested" || status === "pending_payment") return "danger";
  if (status === "paid" || status === "shipped") return "warn";
  if (status === "fulfilled") return "ok";
  if (status === "cancelled") return "danger";
  return "accent";
}

function lineSummary(o: Order) {
  return o.items.map((it) => {
    const name = getProduct(it.product_id)?.name ?? it.product_id;
    return `${name} ×${it.qty}`;
  }).join(" · ");
}

export function OrdersView({ orders, issues }: { orders: Order[]; issues: Issue[] }) {
  const [filter, setFilter] = useState("open");
  const openIds = useMemo(() => new Set(issues.map((i) => i.order_id)), [issues]);
  const issueById = useMemo(() => {
    const m = new Map<string, Issue>();
    for (const i of issues) m.set(i.order_id, i);
    return m;
  }, [issues]);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const f of ORDER_FILTERS) c[f.id] = orders.filter((o) => f.match(o, openIds)).length;
    return c;
  }, [orders, openIds]);
  const match = ORDER_FILTERS.find((f) => f.id === filter) ?? ORDER_FILTERS[0];
  const rows = useMemo(() => {
    const list = orders.filter((o) => match.match(o, openIds));
    return [...list].sort((a, b) => {
      const ao = openIds.has(a.id) ? 0 : 1;
      const bo = openIds.has(b.id) ? 0 : 1;
      if (ao !== bo) return ao - bo;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [orders, match, openIds]);
  return (
    <>
      <div className="chips scroll" role="tablist" aria-label="Sipariş filtresi">
        {ORDER_FILTERS.map((f) => (
          <button key={f.id} className={`chip ${filter === f.id ? "on" : ""}`} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label} {counts[f.id] ?? 0}
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="empty"><Logo size={32} /><h3>Kayıt yok</h3><p>Bu filtrede seed sipariş yok.</p></div>
      ) : (
        <div className="list">
          {rows.map((o) => {
            const issue = issueById.get(o.id);
            const open = openIds.has(o.id);
            return (
              <div className="list-row" key={o.id}>
                <div>
                  <div>{o.id}<span className="faint"> · {shortDate(o.created_at)}</span></div>
                  <div className="faint">{lineSummary(o)}</div>
                  {issue ? <div className="faint" style={{ marginTop: 4 }}>{issue.message}</div> : null}
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong>{money(o.total)}</strong>
                  <div><span className={`tag ${statusTone(o.status, open)}`}>{STATUS_LABEL[o.status] ?? o.status}</span></div>
                </div>
                <Link className="btn" href={`/merchant/sohbet?q=${encodeURIComponent(o.id)}`}>Sor</Link>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
