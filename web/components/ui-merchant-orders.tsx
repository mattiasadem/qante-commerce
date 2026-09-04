"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Issue, Order } from "@/lib/core";
import { STATUS_LABEL, canCancelOrder, getProduct, isStoreCheckoutOrder, money, nextOrderAction, shortDate } from "@/lib/core";
import { Logo } from "@/components/ui-shell";

const ORDER_FILTERS: { id: string; label: string; match: (o: Order, open: Set<string>) => boolean }[] = [
  { id: "all", label: "Tümü", match: () => true },
  { id: "open", label: "Açık", match: (o, open) => open.has(o.id) || (isStoreCheckoutOrder(o.id) && (o.status === "paid" || o.status === "pending_payment" || o.status === "shipped")) },
  { id: "store", label: "Mağaza", match: (o) => isStoreCheckoutOrder(o.id) },
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

export function OrdersView({ orders: initialOrders, issues: initialIssues }: { orders: Order[]; issues: Issue[] }) {
  const params = useSearchParams();
  const focus = (params.get("focus") ?? params.get("id") ?? "").trim();
  const [orders, setOrders] = useState(initialOrders);
  const [issues, setIssues] = useState(initialIssues);
  const [filter, setFilter] = useState(focus ? "store" : "open");
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(focus);

  useEffect(() => {
    if (focus) {
      setFilter("store");
      setHighlight(focus);
      setFlash(`${focus} · mağaza checkout · yerel defter`);
    }
  }, [focus]);

  useEffect(() => {
    void fetch("/api/merchant/orders", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { orders?: Order[]; issues?: Issue[] }) => {
        if (d.orders) setOrders(d.orders);
        if (d.issues) setIssues(d.issues);
      });
  }, []);

  async function act(orderId: string, action: string) {
    setBusy(orderId);
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, action }),
      });
      const data = await res.json() as { order?: Order; orders?: Order[]; issues?: Issue[]; error?: string };
      if (!res.ok || !data.order) {
        setFlash(data.error ?? "İşlem yapılamadı");
        return;
      }
      if (data.orders) setOrders(data.orders);
      else setOrders((xs) => xs.map((o) => (o.id === orderId ? data.order! : o)));
      if (data.issues) setIssues(data.issues);
      setFlash(`${data.order.id} · ${STATUS_LABEL[data.order.status] ?? data.order.status} · yerel defter`);
    } finally {
      setBusy(null);
    }
  }

  async function shipAll(ids: string[]) {
    if (!ids.length) return;
    setBusy("bulk");
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ship_all", ids }),
      });
      const data = await res.json() as { orders?: Order[]; issues?: Issue[]; count?: number; error?: string };
      if (!res.ok || !data.orders) {
        setFlash(data.error ?? "Toplu kargo yazılamadı");
        return;
      }
      setOrders(data.orders);
      if (data.issues) setIssues(data.issues);
      setFlash(`${data.count ?? ids.length} sipariş kargoda · yerel defter · ikas'a gitmedi`);
    } finally {
      setBusy(null);
    }
  }

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
      const ah = highlight && a.id === highlight ? 0 : 1;
      const bh = highlight && b.id === highlight ? 0 : 1;
      if (ah !== bh) return ah - bh;
      const ao = openIds.has(a.id) || isStoreCheckoutOrder(a.id) ? 0 : 1;
      const bo = openIds.has(b.id) || isStoreCheckoutOrder(b.id) ? 0 : 1;
      if (ao !== bo) return ao - bo;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [orders, match, openIds, highlight]);
  const shippable = useMemo(() => rows.filter((o) => o.status === "paid"), [rows]);

  return (
    <>
      <div className="chips scroll" role="tablist" aria-label="Sipariş filtresi">
        {ORDER_FILTERS.map((f) => (
          <button key={f.id} className={`chip ${filter === f.id ? "on" : ""}`} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label} {counts[f.id] ?? 0}
          </button>
        ))}
      </div>
      {flash ? (
        <p className="muted" style={{ marginBottom: 12 }}>
          <span className="banner-demo">{flash}</span>
        </p>
      ) : (
        <p className="muted" style={{ marginTop: -4, marginBottom: 16 }}>
          Mağaza checkout Siparişler&apos;e düşer · Kargola / Toplu kargola / İptal yerel deftere yazar · ikas&apos;a gitmez
        </p>
      )}
      {shippable.length > 0 ? (
        <div className="actions" style={{ marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            className="btn btn-primary"
            type="button"
            disabled={busy === "bulk"}
            onClick={() => void shipAll(shippable.map((o) => o.id))}
          >
            {busy === "bulk" ? "…" : `Toplu kargola (${shippable.length})`}
          </button>
          <span className="faint">görünen ödeme alındı · tek cookie yazımı</span>
        </div>
      ) : null}
      {rows.length === 0 ? (
        <div className="empty"><Logo size={32} /><h3>Kayıt yok</h3><p>Bu filtrede seed sipariş yok.</p></div>
      ) : (
        <div className="list">
          {rows.map((o) => {
            const issue = issueById.get(o.id);
            const open = openIds.has(o.id);
            const cta = nextOrderAction(o.status);
            return (
              <div className="list-row" key={o.id} style={highlight === o.id ? { outline: "1px solid var(--accent, #d8c7a6)", borderRadius: 12 } : undefined}>
                <div>
                  <div>{o.id}<span className="faint"> · {shortDate(o.created_at)}</span>{isStoreCheckoutOrder(o.id) ? <span className="tag accent" style={{ marginLeft: 8 }}>mağaza</span> : null}</div>
                  <div className="faint">{lineSummary(o)}</div>
                  {issue ? <div className="faint" style={{ marginTop: 4 }}>{issue.message}</div> : null}
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong>{money(o.total)}</strong>
                  <div><span className={`tag ${statusTone(o.status, open)}`}>{STATUS_LABEL[o.status] ?? o.status}</span></div>
                </div>
                {cta ? (
                  <button
                    className="btn btn-primary"
                    type="button"
                    disabled={busy === o.id || busy === "bulk"}
                    onClick={() => void act(o.id, cta.action)}
                  >
                    {busy === o.id ? "…" : cta.label}
                  </button>
                ) : null}
                {canCancelOrder(o.status) ? (
                  <button
                    className="btn"
                    type="button"
                    disabled={busy === o.id || busy === "bulk"}
                    onClick={() => void act(o.id, "cancel")}
                  >
                    {busy === o.id ? "…" : "İptal"}
                  </button>
                ) : null}
                <Link className="btn" href={`/merchant/sohbet?q=${encodeURIComponent(o.id)}`}>Sor</Link>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
