"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Issue, Order } from "@/lib/core";
import { STATUS_LABEL, canCancelOrder, getProduct, isStoreCheckoutOrder, money, nextOrderAction, shortDate } from "@/lib/core";
import { Logo } from "@/components/ui-shell";
import { CARRIERS, shipNoteLabel } from "@/components/ui-ship-track";

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
  const [shipDraft, setShipDraft] = useState<Record<string, { carrier: string; tracking: string }>>({});

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
      const draft = shipDraft[orderId];
      const payload: { id: string; action: string; carrier?: string; tracking?: string } = { id: orderId, action };
      if (action === "ship" && draft) {
        if (draft.carrier) payload.carrier = draft.carrier;
        if (draft.tracking.trim()) payload.tracking = draft.tracking.trim();
      }
      const res = await fetch("/api/merchant/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      if (action === "ship") {
        setShipDraft((d) => {
          const next = { ...d };
          delete next[orderId];
          return next;
        });
      }
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

  async function fulfillAll(ids: string[]) {
    if (!ids.length) return;
    setBusy("bulk");
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "fulfill_all", ids }),
      });
      const data = await res.json() as { orders?: Order[]; issues?: Issue[]; count?: number; error?: string };
      if (!res.ok || !data.orders) {
        setFlash(data.error ?? "Toplu teslim yazılamadı");
        return;
      }
      setOrders(data.orders);
      if (data.issues) setIssues(data.issues);
      setFlash(`${data.count ?? ids.length} sipariş teslim · yerel defter · ikas'a gitmedi`);
    } finally {
      setBusy(null);
    }
  }

  async function closeReturnAll(ids: string[]) {
    if (!ids.length) return;
    setBusy("bulk");
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close_return_all", ids }),
      });
      const data = await res.json() as { orders?: Order[]; issues?: Issue[]; count?: number; error?: string };
      if (!res.ok || !data.orders) {
        setFlash(data.error ?? "Toplu iade kapatılamadı");
        return;
      }
      setOrders(data.orders);
      if (data.issues) setIssues(data.issues);
      setFlash(`${data.count ?? ids.length} iade kapatıldı · yerel defter · ikas'a gitmedi`);
    } finally {
      setBusy(null);
    }
  }


  async function markPaidAll(ids: string[]) {
    if (!ids.length) return;
    setBusy("bulk");
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_paid_all", ids }),
      });
      const data = await res.json() as { orders?: Order[]; issues?: Issue[]; count?: number; error?: string };
      if (!res.ok || !data.orders) {
        setFlash(data.error ?? "Toplu ödeme yazılamadı");
        return;
      }
      setOrders(data.orders);
      if (data.issues) setIssues(data.issues);
      setFlash(`${data.count ?? ids.length} ödeme alındı · yerel defter · ikas'a gitmedi`);
    } finally {
      setBusy(null);
    }
  }

  async function cancelAll(ids: string[]) {
    if (!ids.length) return;
    setBusy("bulk");
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel_all", ids }),
      });
      const data = await res.json() as { orders?: Order[]; issues?: Issue[]; count?: number; error?: string };
      if (!res.ok || !data.orders) {
        setFlash(data.error ?? "Toplu iptal yazılamadı");
        return;
      }
      setOrders(data.orders);
      if (data.issues) setIssues(data.issues);
      setFlash(`${data.count ?? ids.length} sipariş iptal · yerel defter · ikas'a gitmedi`);
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
  const fulfillable = useMemo(() => rows.filter((o) => o.status === "shipped"), [rows]);
  const closableReturns = useMemo(() => rows.filter((o) => o.status === "return_requested"), [rows]);
  const payable = useMemo(() => rows.filter((o) => o.status === "pending_payment"), [rows]);
  const cancellable = useMemo(() => rows.filter((o) => canCancelOrder(o.status)), [rows]);

  return (
    <>
      <div className="filter-rail chips scroll" role="tablist" aria-label="Sipariş filtresi">
        {ORDER_FILTERS.map((f) => (
          <button key={f.id} className={`chip ${filter === f.id ? "on" : ""}`} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label} {counts[f.id] ?? 0}
          </button>
        ))}
      </div>
      {flash ? (
        <p className="muted">
          <span className="banner-demo">{flash}</span>
        </p>
      ) : (
        <p className="muted">
          Mağaza checkout Siparişler&apos;e düşer · Kargola / Toplu kargola / Toplu teslim / Toplu iade kapat / Toplu ödeme alındı / Toplu iptal / İptal yerel deftere yazar · ikas&apos;a gitmez
        </p>
      )}
      {(shippable.length > 0 || fulfillable.length > 0 || closableReturns.length > 0 || payable.length > 0 || cancellable.length > 0) ? (
        <div className="bulk-bar approve-bar-sticky" role="toolbar">
          {shippable.length > 0 ? (
            <button
              className="btn btn-primary"
              type="button"
              disabled={busy === "bulk"}
              onClick={() => void shipAll(shippable.map((o) => o.id))}
            >
              {busy === "bulk" ? "…" : `Toplu kargola (${shippable.length})`}
            </button>
          ) : null}
          {fulfillable.length > 0 ? (
            <button
              className="btn btn-primary"
              type="button"
              disabled={busy === "bulk"}
              onClick={() => void fulfillAll(fulfillable.map((o) => o.id))}
            >
              {busy === "bulk" ? "…" : `Toplu teslim (${fulfillable.length})`}
            </button>
          ) : null}
          {closableReturns.length > 0 ? (
            <button
              className="btn btn-primary"
              type="button"
              disabled={busy === "bulk"}
              onClick={() => void closeReturnAll(closableReturns.map((o) => o.id))}
            >
              {busy === "bulk" ? "…" : `Toplu iade kapat (${closableReturns.length})`}
            </button>
          ) : null}
          {payable.length > 0 ? (
            <button
              className="btn btn-primary"
              type="button"
              disabled={busy === "bulk"}
              onClick={() => void markPaidAll(payable.map((o) => o.id))}
            >
              {busy === "bulk" ? "…" : `Toplu ödeme alındı (${payable.length})`}
            </button>
          ) : null}
          {cancellable.length > 0 ? (
            <button
              className="btn btn-danger"
              type="button"
              disabled={busy === "bulk"}
              onClick={() => void cancelAll(cancellable.map((o) => o.id))}
            >
              {busy === "bulk" ? "…" : `Toplu iptal (${cancellable.length})`}
            </button>
          ) : null}
          <span className="faint">görünen filtre · tek cookie yazımı · ikas kapalı</span>
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
              <div className={`list-row ops-row${highlight === o.id ? " hl" : ""}`} key={o.id}>
                <div>
                  <div><strong style={{ fontWeight: 600 }}>{o.id}</strong><span className="faint"> · {shortDate(o.created_at)}</span>{isStoreCheckoutOrder(o.id) ? <span className="tag accent">mağaza</span> : null}</div>
                  <div className="faint">{lineSummary(o)}</div>
                  {issue ? <div className="faint">{issue.message}</div> : null}
                  {o.ship_note ? (
                    <div className="faint" data-cta="merchant-ship-note">
                      Kargo · {shipNoteLabel(o.ship_note) ?? o.ship_note}
                    </div>
                  ) : null}
                  {o.status === "paid" && cta?.action === "ship" ? (
                    <div style={{ marginTop: 8 }} data-cta="ship-track-fields">
                      <div className="chips" style={{ flexWrap: "wrap" }} aria-label="Kargo firması">
                        {CARRIERS.map((c) => {
                          const on = (shipDraft[o.id]?.carrier ?? "") === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              className={`chip ${on ? "on" : ""}`}
                              data-cta="ship-carrier"
                              data-carrier={c.id}
                              disabled={busy === o.id || busy === "bulk"}
                              onClick={() =>
                                setShipDraft((d) => ({
                                  ...d,
                                  [o.id]: { carrier: c.id, tracking: d[o.id]?.tracking ?? "" },
                                }))
                              }
                            >
                              {c.label}
                            </button>
                          );
                        })}
                      </div>
                      <input
                        className="input"
                        type="text"
                        data-cta="ship-tracking"
                        placeholder="Takip no (opsiyonel)"
                        aria-label="Kargo takip numarası"
                        value={shipDraft[o.id]?.tracking ?? ""}
                        disabled={busy === o.id || busy === "bulk"}
                        onChange={(e) =>
                          setShipDraft((d) => ({
                            ...d,
                            [o.id]: {
                              carrier: d[o.id]?.carrier ?? "",
                              tracking: e.target.value.slice(0, 64),
                            },
                          }))
                        }
                        style={{ marginTop: 8, maxWidth: 280 }}
                      />
                    </div>
                  ) : null}
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong style={{ fontVariantNumeric: "tabular-nums" }}>{money(o.total)}</strong>
                  <div><span className={`tag ${statusTone(o.status, open)}`}>{STATUS_LABEL[o.status] ?? o.status}</span></div>
                </div>
                <div className="row-actions">
                  {cta ? (
                    <button className="btn btn-primary btn-sm" type="button" disabled={busy === o.id || busy === "bulk"} onClick={() => void act(o.id, cta.action)}>
                      {busy === o.id ? "…" : cta.label}
                    </button>
                  ) : null}
                  {canCancelOrder(o.status) ? (
                    <button className="btn btn-danger btn-sm" type="button" disabled={busy === o.id || busy === "bulk"} onClick={() => void act(o.id, "cancel")}>
                      {busy === o.id ? "…" : "İptal"}
                    </button>
                  ) : null}
                  <Link className="btn btn-sm" href={`/merchant/sohbet?q=${encodeURIComponent(o.id)}`}>Sor</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
