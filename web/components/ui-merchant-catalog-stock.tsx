"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Alert, StagedChange } from "@/lib/core";
import { getProduct, money, suggestPriceCut, suggestRestockQty } from "@/lib/core";

const STOCK_FILTERS: { id: string; label: string; match: (a: Alert) => boolean }[] = [
  { id: "all", label: "Tümü", match: () => true },
  { id: "out_of_stock", label: "Tükendi", match: (a) => a.kind === "out_of_stock" },
  { id: "low_stock", label: "Düşük", match: (a) => a.kind === "low_stock" },
  { id: "slow_mover", label: "Yavaş", match: (a) => a.kind === "slow_mover" },
];

export function StockView({ alerts }: { alerts: Alert[] }) {
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const f of STOCK_FILTERS) c[f.id] = alerts.filter((a) => f.match(a)).length;
    return c;
  }, [alerts]);
  const match = STOCK_FILTERS.find((f) => f.id === filter) ?? STOCK_FILTERS[0];
  const rows = useMemo(() => alerts.filter((a) => match.match(a)), [alerts, match]);

  const restockIds = useMemo(() => {
    const seen = new Set<string>();
    const ids: string[] = [];
    for (const a of rows) {
      if (a.kind === "slow_mover") continue;
      if (seen.has(a.product_id)) continue;
      seen.add(a.product_id);
      ids.push(a.product_id);
    }
    return ids;
  }, [rows]);

  const discountIds = useMemo(() => {
    const seen = new Set<string>();
    const ids: string[] = [];
    for (const a of rows) {
      if (a.kind !== "slow_mover") continue;
      if (seen.has(a.product_id)) continue;
      seen.add(a.product_id);
      ids.push(a.product_id);
    }
    return ids;
  }, [rows]);

  async function stageRestock(a: Alert) {
    setBusy(a.product_id);
    setFlash(null);
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
      setFlash(`${data.change.product_name} · ${data.change.before.stok} → ${data.change.after.stok} Bekleyen'e eklendi`);
    } finally {
      setBusy(null);
    }
  }

  async function stagePrice(a: Alert) {
    setBusy(a.product_id);
    setFlash(null);
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
      setFlash(`${data.change.product_name} · ${data.change.before.fiyat} → ${data.change.after.fiyat} Bekleyen'e eklendi`);
    } finally {
      setBusy(null);
    }
  }

  async function stageRestockAll() {
    if (!restockIds.length) return;
    setBusy("bulk");
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restock_all", kind: "stock", product_ids: restockIds }),
      });
      const data = await res.json() as { changes?: StagedChange[]; count?: number; error?: string };
      if (!res.ok || !data.changes?.length) {
        setFlash(data.error ?? "Toplu yenile yazılamadı");
        return;
      }
      setFlash(`${data.count ?? data.changes.length} stok önerisi Bekleyen'e eklendi · ikas'a gitmedi`);
    } finally {
      setBusy(null);
    }
  }

  async function stageDiscountAll() {
    if (!discountIds.length) return;
    setBusy("bulk");
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "price_all", kind: "price", product_ids: discountIds }),
      });
      const data = await res.json() as { changes?: StagedChange[]; count?: number; error?: string };
      if (!res.ok || !data.changes?.length) {
        setFlash(data.error ?? "Toplu indirim yazılamadı");
        return;
      }
      setFlash(`${data.count ?? data.changes.length} fiyat önerisi Bekleyen'e eklendi · ikas'a gitmedi`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <div className="filter-rail chips scroll" role="tablist" aria-label="Stok filtresi">
        {STOCK_FILTERS.map((f) => (
          <button key={f.id} className={`chip ${filter === f.id ? "on" : ""}`} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label} {counts[f.id] ?? 0}
          </button>
        ))}
      </div>
      {(restockIds.length || discountIds.length) ? (
        <div className="bulk-bar approve-bar-sticky" role="toolbar">
          {restockIds.length ? (
            <button
              className="btn btn-primary"
              type="button"
              disabled={busy === "bulk"}
              onClick={() => void stageRestockAll()}
            >
              {busy === "bulk" ? "…" : `Toplu yenile (${restockIds.length})`}
            </button>
          ) : null}
          {discountIds.length ? (
            <button
              className="btn btn-primary"
              type="button"
              disabled={busy === "bulk"}
              onClick={() => void stageDiscountAll()}
            >
              {busy === "bulk" ? "…" : `Toplu indirim (${discountIds.length})`}
            </button>
          ) : null}
          <span className="faint">görünen filtre · yerel kuyruk · ikas kapalı</span>
        </div>
      ) : null}
      {flash ? (
        <p className="muted">
          <span className="banner-demo">{flash}</span>{" "}
          <Link href="/merchant/bekleyen">Bekleyen&apos;e git</Link>
        </p>
      ) : (
        <p className="muted">
          Filtre chipleri küme seçer · Yenile stok · İndirim fiyat · yerel kuyruk · Onayla ikas&apos;a gitmez
        </p>
      )}
      <div className="list">
        {rows.map((a) => {
          const isSlow = a.kind === "slow_mover";
          const product = isSlow ? getProduct(a.product_id) : null;
          const faintHint = isSlow
            ? (product ? `öneri ${money(suggestPriceCut(product))}` : "indirim önerisi")
            : `öneri ${suggestRestockQty(a.stock)}`;
          return (
            <div className="list-row" key={`${a.kind}-${a.product_id}`}>
              <div>
                <div>{a.product_name}</div>
                <div className="faint">
                  stok {a.stock} · cover {a.days_cover ?? "—"} gün
                  {a.days_without_sale != null ? ` · ${a.days_without_sale} gündür satış yok` : ""}
                  {" · "}{faintHint}
                </div>
              </div>
              <span className={`tag ${a.kind === "out_of_stock" ? "danger" : "warn"}`}>
                {a.kind === "out_of_stock" ? "tükendi" : a.kind === "low_stock" ? "düşük" : "yavaş"}
              </span>
              {isSlow ? (
                <button className="btn btn-primary" type="button" disabled={busy === a.product_id || busy === "bulk"} onClick={() => void stagePrice(a)}>
                  {busy === a.product_id ? "…" : "İndirim"}
                </button>
              ) : (
                <button className="btn btn-primary" type="button" disabled={busy === a.product_id || busy === "bulk"} onClick={() => void stageRestock(a)}>
                  {busy === a.product_id ? "…" : "Yenile"}
                </button>
              )}
              <Link className="btn" href={`/merchant/sohbet?q=${encodeURIComponent(a.product_name + (isSlow ? " indirim" : " stok yenile"))}`}>Sor</Link>
            </div>
          );
        })}
        {rows.length === 0 ? <div className="list-row"><span className="muted">Bu filtrede uyarı yok.</span></div> : null}
      </div>
    </>
  );
}
