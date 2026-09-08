"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Issue, Order } from "@/lib/core";
import { STATUS_LABEL, canCancelOrder, isStoreCheckoutOrder } from "@/lib/core";
import { Logo } from "@/components/ui-shell";
import { ORDER_FILTERS, ORDER_SORTS, PREF_FILTERS, compareOrdersBySort, orderCategories, orderHasCategory, orderHasPref, orderMatchesQuery, type OrderSortId } from "@/components/ui-merchant-orders-filters";
import { OrderRow } from "@/components/ui-merchant-orders-row";

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
  const prefParam = (params.get("pref") ?? "").trim().toLowerCase();
  const [pref, setPref] = useState<string | null>(prefParam || null);
  const qParam = (params.get("q") ?? "").trim();
  const [q, setQ] = useState(qParam);
  const sortParam = (params.get("sort") ?? "").trim().toLowerCase();
  const initialSort: OrderSortId = (ORDER_SORTS.some((s) => s.id === sortParam) ? sortParam : "newest") as OrderSortId;
  const [sort, setSort] = useState<OrderSortId>(initialSort);
  const catParam = (params.get("cat") ?? "").trim();
  const [cat, setCat] = useState(catParam);

  useEffect(() => {
    if (focus) {
      setFilter("store");
      setHighlight(focus);
      setFlash(`${focus} · mağaza checkout · yerel defter`);
    }
  }, [focus]);

  useEffect(() => {
    if (prefParam) setPref(prefParam);
  }, [prefParam]);

  useEffect(() => {
    if (qParam) setQ(qParam);
  }, [qParam]);

  useEffect(() => {
    if (ORDER_SORTS.some((s) => s.id === sortParam)) setSort(sortParam as OrderSortId);
  }, [sortParam]);

  useEffect(() => {
    if (catParam) setCat(catParam);
  }, [catParam]);

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
      const data = (await res.json()) as { order?: Order; orders?: Order[]; issues?: Issue[]; error?: string };
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

  async function bulk(action: string, ids: string[], emptyMsg: string, okMsg: (n: number) => string) {
    if (!ids.length) return;
    setBusy("bulk");
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids }),
      });
      const data = (await res.json()) as { orders?: Order[]; issues?: Issue[]; count?: number; error?: string };
      if (!res.ok || !data.orders) {
        setFlash(data.error ?? emptyMsg);
        return;
      }
      setOrders(data.orders);
      if (data.issues) setIssues(data.issues);
      setFlash(okMsg(data.count ?? ids.length));
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
  const statusRows = useMemo(() => orders.filter((o) => match.match(o, openIds)), [orders, match, openIds]);
  const prefCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of PREF_FILTERS) c[p.id] = statusRows.filter((o) => orderHasPref(o, p.id)).length;
    return c;
  }, [statusRows]);
  const visiblePrefs = useMemo(() => PREF_FILTERS.filter((p) => (prefCounts[p.id] ?? 0) > 0 || pref === p.id), [prefCounts, pref]);
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of statusRows) {
      for (const name of orderCategories(o)) map.set(name, (map.get(name) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "tr"));
  }, [statusRows]);
  const rows = useMemo(() => {
    const list = (pref ? statusRows.filter((o) => orderHasPref(o, pref)) : statusRows)
      .filter((o) => orderHasCategory(o, cat))
      .filter((o) => orderMatchesQuery(o, q));
    return [...list].sort((a, b) => {
      const ah = highlight && a.id === highlight ? 0 : 1;
      const bh = highlight && b.id === highlight ? 0 : 1;
      if (ah !== bh) return ah - bh;
      const ao = openIds.has(a.id) || isStoreCheckoutOrder(a.id) ? 0 : 1;
      const bo = openIds.has(b.id) || isStoreCheckoutOrder(b.id) ? 0 : 1;
      if (ao !== bo) return ao - bo;
      return compareOrdersBySort(a, b, sort);
    });
  }, [statusRows, pref, cat, q, openIds, highlight, sort]);
  const shippable = useMemo(() => rows.filter((o) => o.status === "paid"), [rows]);
  const fulfillable = useMemo(() => rows.filter((o) => o.status === "shipped"), [rows]);
  const closableReturns = useMemo(() => rows.filter((o) => o.status === "return_requested"), [rows]);
  const payable = useMemo(() => rows.filter((o) => o.status === "pending_payment"), [rows]);
  const cancellable = useMemo(() => rows.filter((o) => canCancelOrder(o.status)), [rows]);

  return (
    <>
      <div className="filter-rail chips scroll" role="tablist" aria-label="Sipariş filtresi">
        {ORDER_FILTERS.map((f) => (
          <button
            key={f.id}
            className={`chip ${filter === f.id ? "on" : ""}`}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label} {counts[f.id] ?? 0}
          </button>
        ))}
      </div>
      {categories.length ? (
        <div className="filter-rail chips scroll" role="tablist" aria-label="Kategori" data-cta="orders-category-rail" style={{ marginTop: 8 }}>
          <button
            className={`chip ${cat === "" ? "on" : ""}`}
            type="button"
            aria-pressed={cat === ""}
            data-cta="orders-category"
            data-cat=""
            onClick={() => setCat("")}
          >
            Tüm kategoriler
          </button>
          {categories.map(([name, n]) => (
            <button
              key={name}
              className={`chip ${cat === name ? "on" : ""}`}
              type="button"
              aria-pressed={cat === name}
              data-cta="orders-category"
              data-cat={name}
              onClick={() => setCat((cur) => (cur === name ? "" : name))}
            >
              {name} · {n}
            </button>
          ))}
        </div>
      ) : null}
      {visiblePrefs.length > 0 ? (
        <div className="filter-rail chips scroll" role="tablist" aria-label="Tercih filtresi" data-cta="pref-filter-rail" style={{ marginTop: 8 }}>
          <button
            className={`chip ${pref === null ? "on" : ""}`}
            type="button"
            aria-pressed={pref === null}
            data-cta="pref-filter-all"
            onClick={() => setPref(null)}
          >
            Tercih · hepsi
          </button>
          {visiblePrefs.map((p) => (
            <button
              key={p.id}
              className={`chip ${pref === p.id ? "on" : ""}`}
              type="button"
              aria-pressed={pref === p.id}
              data-cta="pref-filter"
              data-pref={p.id}
              onClick={() => setPref((cur) => (cur === p.id ? null : p.id))}
            >
              {p.label} {prefCounts[p.id] ?? 0}
            </button>
          ))}
        </div>
      ) : null}
      <div className="ops-search" data-cta="orders-search" style={{ marginTop: 10, marginBottom: 4, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input
          className="input"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value.slice(0, 80))}
          placeholder="Ara · sipariş no, ürün, not, sku…"
          aria-label="Sipariş ara"
          data-cta="orders-search-input"
          style={{ flex: "1 1 220px", maxWidth: 420 }}
        />
        {q.trim() ? (
          <button className="btn btn-sm" type="button" data-cta="orders-search-clear" onClick={() => setQ("")}>
            Temizle
          </button>
        ) : null}
        <span className="faint">{q.trim() || cat ? `${rows.length} sonuç` : "durum + kategori + tercih üstünde arar"}</span>
      </div>
      <div className="filter-rail chips scroll" role="tablist" aria-label="Sıralama" data-cta="orders-sort-rail" style={{ marginTop: 8 }}>
        {ORDER_SORTS.map((s) => (
          <button
            key={s.id}
            className={`chip ${sort === s.id ? "on" : ""}`}
            type="button"
            aria-pressed={sort === s.id}
            data-cta="orders-sort"
            data-sort={s.id}
            onClick={() => setSort(s.id)}
          >
            {s.label}
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
      {shippable.length > 0 || fulfillable.length > 0 || closableReturns.length > 0 || payable.length > 0 || cancellable.length > 0 ? (
        <div className="bulk-bar approve-bar-sticky" role="toolbar">
          {shippable.length > 0 ? (
            <button
              className="btn btn-primary"
              type="button"
              disabled={busy === "bulk"}
              onClick={() => void bulk("ship_all", shippable.map((o) => o.id), "Toplu kargo yazılamadı", (n) => `${n} sipariş kargoda · yerel defter · ikas'a gitmedi`)}
            >
              {busy === "bulk" ? "…" : `Toplu kargola (${shippable.length})`}
            </button>
          ) : null}
          {fulfillable.length > 0 ? (
            <button
              className="btn btn-primary"
              type="button"
              disabled={busy === "bulk"}
              onClick={() => void bulk("fulfill_all", fulfillable.map((o) => o.id), "Toplu teslim yazılamadı", (n) => `${n} sipariş teslim · yerel defter · ikas'a gitmedi`)}
            >
              {busy === "bulk" ? "…" : `Toplu teslim (${fulfillable.length})`}
            </button>
          ) : null}
          {closableReturns.length > 0 ? (
            <button
              className="btn btn-primary"
              type="button"
              disabled={busy === "bulk"}
              onClick={() => void bulk("close_return_all", closableReturns.map((o) => o.id), "Toplu iade kapatılamadı", (n) => `${n} iade kapatıldı · yerel defter · ikas'a gitmedi`)}
            >
              {busy === "bulk" ? "…" : `Toplu iade kapat (${closableReturns.length})`}
            </button>
          ) : null}
          {payable.length > 0 ? (
            <button
              className="btn btn-primary"
              type="button"
              disabled={busy === "bulk"}
              onClick={() => void bulk("mark_paid_all", payable.map((o) => o.id), "Toplu ödeme yazılamadı", (n) => `${n} ödeme alındı · yerel defter · ikas'a gitmedi`)}
            >
              {busy === "bulk" ? "…" : `Toplu ödeme alındı (${payable.length})`}
            </button>
          ) : null}
          {cancellable.length > 0 ? (
            <button
              className="btn btn-danger"
              type="button"
              disabled={busy === "bulk"}
              onClick={() => void bulk("cancel_all", cancellable.map((o) => o.id), "Toplu iptal yazılamadı", (n) => `${n} sipariş iptal · yerel defter · ikas'a gitmedi`)}
            >
              {busy === "bulk" ? "…" : `Toplu iptal (${cancellable.length})`}
            </button>
          ) : null}
          <span className="faint">görünen filtre · tek cookie yazımı · ikas kapalı</span>
        </div>
      ) : null}
      {rows.length === 0 ? (
        <div className="empty">
          <Logo size={32} />
          <h3>Kayıt yok</h3>
          <p>{q.trim() || cat || pref ? "Arama + filtre birleşiminde kayıt yok." : "Bu durum/tercih filtresinde seed sipariş yok."}</p>
        </div>
      ) : (
        <div className="list">
          {rows.map((o) => (
            <OrderRow
              key={o.id}
              o={o}
              issue={issueById.get(o.id)}
              open={openIds.has(o.id)}
              highlight={highlight}
              busy={busy}
              shipDraft={shipDraft}
              setShipDraft={setShipDraft}
              onAct={act}
              pref={pref}
              onPrefSelect={(key) => setPref((cur) => (cur === key ? null : key))}
            />
          ))}
        </div>
      )}
    </>
  );
}
