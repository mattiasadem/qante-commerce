"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Alert, Issue, Snapshot, StagedChange, WeeklyBar } from "@/lib/core";
import { getProduct, money, number, percent, suggestPriceCut, suggestRestockQty } from "@/lib/core";

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

function issueAction(kind: string): { action: string; label: string } | null {
  if (kind === "unshipped") return { action: "ship", label: "Kargola" };
  if (kind === "pending_payment") return { action: "mark_paid", label: "Ödeme alındı" };
  if (kind === "return_open") return { action: "close_return", label: "İade kapat" };
  return null;
}

function alertKey(a: Alert) {
  return `${a.kind}:${a.product_id}`;
}

export function AlertList({ alerts, issues }: { alerts: Alert[]; issues: Issue[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [gone, setGone] = useState<Set<string>>(() => new Set());
  const [flash, setFlash] = useState<string | null>(null);
  const [flashHref, setFlashHref] = useState("/merchant/siparisler");

  const visibleAlerts = useMemo(() => alerts.filter((a) => !gone.has(alertKey(a))), [alerts, gone]);
  const visibleIssues = useMemo(() => issues.filter((i) => !gone.has(i.order_id)), [issues, gone]);

  const restockIds = useMemo(
    () => visibleAlerts.filter((a) => a.kind === "low_stock" || a.kind === "out_of_stock").map((a) => a.product_id),
    [visibleAlerts],
  );
  const discountIds = useMemo(
    () => visibleAlerts.filter((a) => a.kind === "slow_mover").map((a) => a.product_id),
    [visibleAlerts],
  );
  const shipIds = useMemo(() => visibleIssues.filter((i) => i.kind === "unshipped").map((i) => i.order_id), [visibleIssues]);
  const payIds = useMemo(() => visibleIssues.filter((i) => i.kind === "pending_payment").map((i) => i.order_id), [visibleIssues]);
  const returnIds = useMemo(() => visibleIssues.filter((i) => i.kind === "return_open").map((i) => i.order_id), [visibleIssues]);
  const hasBulk = restockIds.length > 0 || discountIds.length > 0 || shipIds.length > 0 || payIds.length > 0 || returnIds.length > 0;

  async function act(orderId: string, action: string) {
    setBusy(orderId);
    setFlash(null);
    setFlashHref("/merchant/siparisler");
    try {
      const res = await fetch("/api/merchant/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, action }),
      });
      const data = await res.json() as { order?: { id: string; status: string }; error?: string };
      if (!res.ok || !data.order) {
        setFlash(data.error ?? "İşlem yapılamadı");
        return;
      }
      setGone((s) => new Set(s).add(orderId));
      setFlash(`${data.order.id} · yerel defter güncellendi`);
    } finally {
      setBusy(null);
    }
  }

  async function bulkOrders(action: string, ids: string[], label: string) {
    if (!ids.length) return;
    setBusy("bulk");
    setFlash(null);
    setFlashHref("/merchant/siparisler");
    try {
      const res = await fetch("/api/merchant/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids }),
      });
      const data = await res.json() as { count?: number; error?: string };
      if (!res.ok) {
        setFlash(data.error ?? "Toplu yazılamadı");
        return;
      }
      setGone((s) => {
        const n = new Set(s);
        for (const id of ids) n.add(id);
        return n;
      });
      setFlash(`${data.count ?? ids.length} ${label} · yerel defter · ikas'a gitmedi`);
    } finally {
      setBusy(null);
    }
  }

  async function stageRestock(a: Alert) {
    const key = alertKey(a);
    setBusy(key);
    setFlash(null);
    setFlashHref("/merchant/bekleyen");
    try {
      const target = suggestRestockQty(a.stock);
      const res = await fetch("/api/merchant/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "stock", product_id: a.product_id, target_qty: target }),
      });
      const data = await res.json() as { change?: StagedChange; error?: string };
      if (!res.ok || !data.change) {
        setFlash(data.error ?? "Kuyruğa yazılamadı");
        return;
      }
      setGone((s) => new Set(s).add(key));
      setFlash(`${data.change.product_name} · ${data.change.before.stok} → ${data.change.after.stok} Bekleyen'e eklendi`);
    } finally {
      setBusy(null);
    }
  }

  async function stagePrice(a: Alert) {
    const key = alertKey(a);
    setBusy(key);
    setFlash(null);
    setFlashHref("/merchant/bekleyen");
    try {
      const product = getProduct(a.product_id);
      if (!product) {
        setFlash("Ürün bulunamadı");
        return;
      }
      const res = await fetch("/api/merchant/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "price", product_id: a.product_id, target_price: suggestPriceCut(product) }),
      });
      const data = await res.json() as { change?: StagedChange; error?: string };
      if (!res.ok || !data.change) {
        setFlash(data.error ?? "Kuyruğa yazılamadı");
        return;
      }
      setGone((s) => new Set(s).add(key));
      setFlash(`${data.change.product_name} · ${data.change.before.fiyat} → ${data.change.after.fiyat} Bekleyen'e eklendi`);
    } finally {
      setBusy(null);
    }
  }

  async function stageRestockAll() {
    if (!restockIds.length) return;
    setBusy("bulk");
    setFlash(null);
    setFlashHref("/merchant/bekleyen");
    try {
      const res = await fetch("/api/merchant/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restock_all", kind: "stock", product_ids: restockIds }),
      });
      const data = await res.json() as { count?: number; error?: string };
      if (!res.ok) {
        setFlash(data.error ?? "Toplu yenile yazılamadı");
        return;
      }
      setGone((s) => {
        const n = new Set(s);
        for (const a of visibleAlerts) {
          if (a.kind === "low_stock" || a.kind === "out_of_stock") n.add(alertKey(a));
        }
        return n;
      });
      setFlash(`${data.count ?? restockIds.length} stok yenile Bekleyen'e · ikas'a gitmedi`);
    } finally {
      setBusy(null);
    }
  }

  async function stagePriceAll() {
    if (!discountIds.length) return;
    setBusy("bulk");
    setFlash(null);
    setFlashHref("/merchant/bekleyen");
    try {
      const res = await fetch("/api/merchant/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "price_all", kind: "price", product_ids: discountIds }),
      });
      const data = await res.json() as { count?: number; error?: string };
      if (!res.ok) {
        setFlash(data.error ?? "Toplu indirim yazılamadı");
        return;
      }
      setGone((s) => {
        const n = new Set(s);
        for (const a of visibleAlerts) {
          if (a.kind === "slow_mover") n.add(alertKey(a));
        }
        return n;
      });
      setFlash(`${data.count ?? discountIds.length} indirim Bekleyen'e · ikas'a gitmedi`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      {flash ? (
        <p className="muted">
          <span className="banner-demo">{flash}</span>{" "}
          <Link href={flashHref}>{flashHref.includes("bekleyen") ? "Bekleyen'e git" : "Siparişler"}</Link>
        </p>
      ) : (
        <p className="muted">
          Toplu yenile/indirim Bekleyen&apos;e · Toplu kargo/ödeme/iade yerel defter · ikas&apos;a gitmez
        </p>
      )}
      {hasBulk ? (
        <div className="bulk-bar approve-bar-sticky" role="toolbar">
          {restockIds.length > 0 ? (
            <button className="btn btn-primary" type="button" disabled={busy === "bulk"} onClick={() => void stageRestockAll()}>
              {busy === "bulk" ? "…" : `Toplu yenile (${restockIds.length})`}
            </button>
          ) : null}
          {discountIds.length > 0 ? (
            <button className="btn btn-primary" type="button" disabled={busy === "bulk"} onClick={() => void stagePriceAll()}>
              {busy === "bulk" ? "…" : `Toplu indirim (${discountIds.length})`}
            </button>
          ) : null}
          {shipIds.length > 0 ? (
            <button className="btn btn-primary" type="button" disabled={busy === "bulk"} onClick={() => void bulkOrders("ship_all", shipIds, "kargolandı")}>
              {busy === "bulk" ? "…" : `Toplu kargola (${shipIds.length})`}
            </button>
          ) : null}
          {payIds.length > 0 ? (
            <button className="btn btn-primary" type="button" disabled={busy === "bulk"} onClick={() => void bulkOrders("mark_paid_all", payIds, "ödeme alındı")}>
              {busy === "bulk" ? "…" : `Toplu ödeme alındı (${payIds.length})`}
            </button>
          ) : null}
          {returnIds.length > 0 ? (
            <button className="btn btn-primary" type="button" disabled={busy === "bulk"} onClick={() => void bulkOrders("close_return_all", returnIds, "iade kapandı")}>
              {busy === "bulk" ? "…" : `Toplu iade kapat (${returnIds.length})`}
            </button>
          ) : null}
          <span className="faint">Özet dikkat listesi · ikas kapalı</span>
        </div>
      ) : null}
      <div className="list">
        {visibleAlerts.map((a) => {
          const isSlow = a.kind === "slow_mover";
          const busyKey = alertKey(a);
          const product = isSlow ? getProduct(a.product_id) : null;
          const faintHint = isSlow
            ? (product ? `öneri ${money(suggestPriceCut(product))}` : "indirim önerisi")
            : `öneri ${suggestRestockQty(a.stock)}`;
          return (
            <div className="list-row" key={busyKey}>
              <div>
                <div>{a.message}</div>
                <div className="faint">
                  {a.product_name}
                  {a.days_cover != null ? ` · ${a.days_cover} gün cover` : ""}
                  {a.days_without_sale != null ? ` · ${a.days_without_sale} gündür satış yok` : ""}
                  {" · "}{faintHint}
                </div>
              </div>
              <span className={`tag ${a.kind === "out_of_stock" ? "danger" : "warn"}`}>
                {a.kind === "out_of_stock" ? "tükendi" : a.kind === "low_stock" ? "düşük stok" : "yavaş"}
              </span>
              {isSlow ? (
                <button className="btn btn-primary" type="button" disabled={busy === busyKey || busy === "bulk"} onClick={() => void stagePrice(a)}>
                  {busy === busyKey ? "…" : "İndirim"}
                </button>
              ) : (
                <button className="btn btn-primary" type="button" disabled={busy === busyKey || busy === "bulk"} onClick={() => void stageRestock(a)}>
                  {busy === busyKey ? "…" : "Yenile"}
                </button>
              )}
              <Link className="btn" href={`/merchant/sohbet?q=${encodeURIComponent(a.product_name + (isSlow ? " indirim" : " stok yenile"))}`}>Sor</Link>
            </div>
          );
        })}
        {visibleIssues.map((i) => {
          const cta = issueAction(i.kind);
          return (
            <div className="list-row" key={`${i.kind}-${i.order_id}`}>
              <div><div>{i.message}</div><div className="faint">{money(i.total)}</div></div>
              <span className="tag danger">{i.kind === "unshipped" ? "kargolanmadı" : i.kind === "pending_payment" ? "ödeme" : "iade"}</span>
              {cta ? (
                <button className="btn btn-primary" type="button" disabled={busy === i.order_id || busy === "bulk"} onClick={() => void act(i.order_id, cta.action)}>
                  {busy === i.order_id ? "…" : cta.label}
                </button>
              ) : null}
              <Link className="btn" href={`/merchant/sohbet?q=${encodeURIComponent(i.order_id)}`}>Sor</Link>
            </div>
          );
        })}
        {visibleAlerts.length === 0 && visibleIssues.length === 0 ? <div className="list-row"><span className="muted">Dikkat gerektiren kayıt yok.</span></div> : null}
      </div>
    </>
  );
}
