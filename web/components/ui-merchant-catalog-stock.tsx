"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Alert, StagedChange } from "@/lib/core";
import { getProduct, money, suggestPriceCut, suggestRestockQty } from "@/lib/core";

const STOCK_FILTERS: { id: string; label: string; match: (a: Alert) => boolean }[] = [
  { id: "all", label: "Tümü", match: () => true },
  { id: "out_of_stock", label: "Tükendi", match: (a) => a.kind === "out_of_stock" },
  { id: "low_stock", label: "Düşük", match: (a) => a.kind === "low_stock" },
  { id: "slow_mover", label: "Yavaş", match: (a) => a.kind === "slow_mover" },
];

function alertCategory(a: Alert): string {
  return (getProduct(a.product_id)?.category ?? "").trim();
}

/** Case-insensitive match on product name, id, category, message, kind. */
export function alertMatchesQuery(a: Alert, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  if (a.product_id.toLowerCase().includes(needle)) return true;
  if (a.product_name.toLowerCase().includes(needle)) return true;
  if (alertCategory(a).toLowerCase().includes(needle)) return true;
  if ((a.message ?? "").toLowerCase().includes(needle)) return true;
  if (a.kind.toLowerCase().includes(needle)) return true;
  const kindAliases =
    a.kind === "out_of_stock" ? "tükendi tukendi" :
    a.kind === "low_stock" ? "düşük dusuk" :
    a.kind === "slow_mover" ? "yavaş yavas" : "";
  if (needle.length >= 3 && kindAliases.includes(needle)) return true;
  return false;
}

export type StockSortId = "urgency" | "stock_asc" | "name" | "cover_asc";

export const STOCK_SORTS: { id: StockSortId; label: string }[] = [
  { id: "urgency", label: "Öncelik" },
  { id: "stock_asc", label: "Stok ↑" },
  { id: "name", label: "Ad A→Z" },
  { id: "cover_asc", label: "Cover ↑" },
];

function urgencyRank(kind: string): number {
  if (kind === "out_of_stock") return 0;
  if (kind === "low_stock") return 1;
  if (kind === "slow_mover") return 2;
  return 9;
}

export function compareAlertsBySort(a: Alert, b: Alert, sort: StockSortId): number {
  if (sort === "stock_asc") {
    const d = a.stock - b.stock;
    if (d !== 0) return d;
    return a.product_name.localeCompare(b.product_name, "tr");
  }
  if (sort === "cover_asc") {
    const ac = a.days_cover ?? 9999;
    const bc = b.days_cover ?? 9999;
    const d = ac - bc;
    if (d !== 0) return d;
    return a.product_name.localeCompare(b.product_name, "tr");
  }
  if (sort === "name") {
    return a.product_name.localeCompare(b.product_name, "tr");
  }
  const d = urgencyRank(a.kind) - urgencyRank(b.kind);
  if (d !== 0) return d;
  const sd = a.stock - b.stock;
  if (sd !== 0) return sd;
  return a.product_name.localeCompare(b.product_name, "tr");
}

function stockQstr(filter: string, cat: string, q: string, sort: StockSortId) {
  const sp = new URLSearchParams();
  if (filter !== "all") sp.set("filter", filter);
  if (cat.trim()) sp.set("cat", cat.trim());
  const qq = q.trim().slice(0, 80);
  if (qq) sp.set("q", qq);
  if (sort !== "urgency") sp.set("sort", sort);
  return sp.toString();
}

const STOCK_FILTER_IDS = STOCK_FILTERS.map((f) => f.id);

export function StockView({ alerts }: { alerts: Alert[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname() || "/merchant/stok";
  const filterParam = (params.get("filter") ?? params.get("kind") ?? params.get("status") ?? "").trim().toLowerCase();
  const catParam = (params.get("cat") ?? "").trim();
  const qParam = (params.get("q") ?? "").trim();
  const sortParam = (params.get("sort") ?? "").trim().toLowerCase();
  const initialFilter = STOCK_FILTER_IDS.includes(filterParam) ? filterParam : "all";
  const initialSort: StockSortId = (STOCK_SORTS.some((s) => s.id === sortParam) ? sortParam : "urgency") as StockSortId;

  const [filter, setFilter] = useState(initialFilter);
  const [cat, setCat] = useState(catParam);
  const [q, setQ] = useState(qParam);
  const [sort, setSort] = useState<StockSortId>(initialSort);
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (STOCK_FILTER_IDS.includes(filterParam)) setFilter(filterParam);
    else if (!filterParam) setFilter("all");
  }, [filterParam]);
  useEffect(() => {
    setCat(catParam);
  }, [catParam]);
  useEffect(() => {
    setQ(qParam);
  }, [qParam]);
  useEffect(() => {
    if (STOCK_SORTS.some((s) => s.id === sortParam)) setSort(sortParam as StockSortId);
    else if (!sortParam) setSort("urgency");
  }, [sortParam]);
  useEffect(() => {
    const next = stockQstr(filter, cat, q, sort);
    const cur = stockQstr(
      STOCK_FILTER_IDS.includes(filterParam) ? filterParam : "all",
      catParam,
      qParam,
      (STOCK_SORTS.some((s) => s.id === sortParam) ? sortParam : "urgency") as StockSortId,
    );
    if (next === cur) return;
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [filter, cat, q, sort, filterParam, catParam, qParam, sortParam, pathname, router]);

  async function copyLink() {
    const qs = stockQstr(filter, cat, q, sort);
    const path = qs ? `${pathname}?${qs}` : pathname;
    const href = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const f of STOCK_FILTERS) c[f.id] = alerts.filter((a) => f.match(a)).length;
    return c;
  }, [alerts]);
  const match = STOCK_FILTERS.find((f) => f.id === filter) ?? STOCK_FILTERS[0];
  const statusRows = useMemo(() => alerts.filter((a) => match.match(a)), [alerts, match]);
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of statusRows) {
      const c = alertCategory(a);
      if (!c) continue;
      map.set(c, (map.get(c) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "tr"));
  }, [statusRows]);
  const rows = useMemo(() => {
    const filtered = statusRows.filter((a) => {
      if (cat && alertCategory(a) !== cat) return false;
      return alertMatchesQuery(a, q);
    });
    return [...filtered].sort((a, b) => compareAlertsBySort(a, b, sort));
  }, [statusRows, cat, q, sort]);

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
    <div data-cta="stock-deeplink">
      <div className="filter-rail chips scroll" role="tablist" aria-label="Stok filtresi">
        {STOCK_FILTERS.map((f) => (
          <button
            key={f.id}
            className={`chip ${filter === f.id ? "on" : ""}`}
            type="button"
            aria-pressed={filter === f.id}
            data-cta="stock-filter"
            data-filter={f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label} {counts[f.id] ?? 0}
          </button>
        ))}
      </div>
      {categories.length ? (
        <div className="filter-rail chips scroll" role="tablist" aria-label="Kategori" data-cta="stock-category-rail" style={{ marginTop: 8 }}>
          <button
            className={`chip ${cat === "" ? "on" : ""}`}
            type="button"
            aria-pressed={cat === ""}
            data-cta="stock-category"
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
              data-cta="stock-category"
              data-cat={name}
              onClick={() => setCat(cat === name ? "" : name)}
            >
              {name} · {n}
            </button>
          ))}
        </div>
      ) : null}
      <div className="ops-search" data-cta="stock-search" style={{ marginTop: 10, marginBottom: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input
          className="input"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value.slice(0, 80))}
          placeholder="Ara · ürün, kategori, uyarı…"
          aria-label="Stok ara"
          data-cta="stock-search-input"
          style={{ flex: "1 1 220px", maxWidth: 420 }}
        />
        {q.trim() ? (
          <button className="btn btn-sm" type="button" data-cta="stock-search-clear" onClick={() => setQ("")}>
            Temizle
          </button>
        ) : null}
        <span className="faint">{q.trim() || cat ? `${rows.length} uyarı` : "durum + kategori üstünde arar"}</span>
      </div>
      <div className="filter-rail chips scroll" role="tablist" aria-label="Sıralama" data-cta="stock-sort-rail" style={{ marginTop: 8, marginBottom: 12 }}>
        {STOCK_SORTS.map((s) => (
          <button
            key={s.id}
            className={`chip ${sort === s.id ? "on" : ""}`}
            type="button"
            aria-pressed={sort === s.id}
            data-cta="stock-sort"
            data-sort={s.id}
            onClick={() => setSort(s.id)}
          >
            {s.label}
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
          Ara + kategori + sırala · Yenile stok · İndirim fiyat · yerel kuyruk · Onayla ikas&apos;a gitmez
          {(filter !== "all") || cat.trim() || q.trim() || (sort !== "urgency") ? " · URL filtreleri açık" : ""}
          {" · "}
          <button className="chip" type="button" data-cta="stock-copy-link" onClick={() => void copyLink()}>
            {copied ? "Kopyalandı" : "Linki kopyala"}
          </button>
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
                  {alertCategory(a) ? `${alertCategory(a)} · ` : ""}stok {a.stock} · cover {a.days_cover ?? "—"} gün
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
        {rows.length === 0 ? (
          <div className="list-row">
            <span className="muted">{q.trim() || cat ? "Arama + kategori birleşiminde uyarı yok." : "Bu filtrede uyarı yok."}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
