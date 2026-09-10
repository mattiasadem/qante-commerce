"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Alert, Issue } from "@/lib/core";
import { getProduct, money, suggestPriceCut, suggestRestockQty } from "@/lib/core";
import {
  OZET_FILTERS, OZET_SORTS, alertCategory, alertHasCategory, alertKey,
  alertMatchesOzet, alertMatchesOzetQuery, compareAlertsBySort, compareIssuesBySort,
  issueAction, issueCategories, issueHasCategory, issueMatchesOzet, issueMatchesOzetQuery,
  type OzetFilterId, type OzetSortId,
} from "@/components/ui-merchant-metrics-filters";
import { useOzetAlertActions } from "@/components/ui-merchant-metrics-actions";
import { OzetAttentionEmpty } from "@/components/ui-merchant-ozet-empty";

function qstr(filter: OzetFilterId, cat: string, q: string, sort: OzetSortId) {
  const sp = new URLSearchParams();
  if (filter !== "all") sp.set("kind", filter);
  if (cat.trim()) sp.set("cat", cat.trim());
  const qq = q.trim().slice(0, 80);
  if (qq) sp.set("q", qq);
  if (sort !== "priority") sp.set("sort", sort);
  return sp.toString();
}

export function AlertList({ alerts, issues }: { alerts: Alert[]; issues: Issue[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname() || "/merchant";
  const kindParam = (params.get("kind") ?? params.get("filter") ?? "").trim().toLowerCase();
  const catParam = (params.get("cat") ?? "").trim();
  const qParam = (params.get("q") ?? "").trim();
  const sortParam = (params.get("sort") ?? "").trim().toLowerCase();
  const [filter, setFilter] = useState<OzetFilterId>((OZET_FILTERS.some((f) => f.id === kindParam) ? kindParam : "all") as OzetFilterId);
  const [cat, setCat] = useState(catParam);
  const [q, setQ] = useState(qParam);
  const [sort, setSort] = useState<OzetSortId>((OZET_SORTS.some((s) => s.id === sortParam) ? sortParam : "priority") as OzetSortId);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (OZET_FILTERS.some((f) => f.id === kindParam)) setFilter(kindParam as OzetFilterId);
    else if (!kindParam) setFilter("all");
  }, [kindParam]);
  useEffect(() => { setCat(catParam); }, [catParam]);
  useEffect(() => { setQ(qParam); }, [qParam]);
  useEffect(() => {
    if (OZET_SORTS.some((s) => s.id === sortParam)) setSort(sortParam as OzetSortId);
    else if (!sortParam) setSort("priority");
  }, [sortParam]);
  useEffect(() => {
    const next = qstr(filter, cat, q, sort);
    const cur = qstr(
      (OZET_FILTERS.some((f) => f.id === kindParam) ? kindParam : "all") as OzetFilterId,
      catParam, qParam,
      (OZET_SORTS.some((s) => s.id === sortParam) ? sortParam : "priority") as OzetSortId,
    );
    if (next === cur) return;
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [filter, cat, q, sort, kindParam, catParam, qParam, sortParam, pathname, router]);

  async function copyLink() {
    const qs = qstr(filter, cat, q, sort);
    const path = qs ? `${pathname}?${qs}` : pathname;
    const href = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
    try { await navigator.clipboard.writeText(href); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* */ }
  }

  const {
    busy, flash, flashHref, visibleAlerts: aliveAlerts, visibleIssues: aliveIssues,
    act, bulkOrders, stageRestock, stagePrice, stageRestockAll, stagePriceAll,
  } = useOzetAlertActions(alerts, issues, filter);

  const kindAlerts = useMemo(() => aliveAlerts.filter((a) => alertMatchesOzet(a, filter)), [aliveAlerts, filter]);
  const kindIssues = useMemo(() => aliveIssues.filter((i) => issueMatchesOzet(i, filter)), [aliveIssues, filter]);
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of kindAlerts) { const n = alertCategory(a); if (n) map.set(n, (map.get(n) ?? 0) + 1); }
    for (const i of kindIssues) for (const n of issueCategories(i)) map.set(n, (map.get(n) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "tr"));
  }, [kindAlerts, kindIssues]);
  const visibleAlerts = useMemo(() => [...kindAlerts].filter((a) => alertHasCategory(a, cat)).filter((a) => alertMatchesOzetQuery(a, q)).sort((a, b) => compareAlertsBySort(a, b, sort)), [kindAlerts, cat, q, sort]);
  const visibleIssues = useMemo(() => [...kindIssues].filter((i) => issueHasCategory(i, cat)).filter((i) => issueMatchesOzetQuery(i, q)).sort((a, b) => compareIssuesBySort(a, b, sort)), [kindIssues, cat, q, sort]);
  const restockIds = useMemo(() => visibleAlerts.filter((a) => a.kind === "low_stock" || a.kind === "out_of_stock").map((a) => a.product_id), [visibleAlerts]);
  const discountIds = useMemo(() => visibleAlerts.filter((a) => a.kind === "slow_mover").map((a) => a.product_id), [visibleAlerts]);
  const shipIds = useMemo(() => visibleIssues.filter((i) => i.kind === "unshipped").map((i) => i.order_id), [visibleIssues]);
  const payIds = useMemo(() => visibleIssues.filter((i) => i.kind === "pending_payment").map((i) => i.order_id), [visibleIssues]);
  const returnIds = useMemo(() => visibleIssues.filter((i) => i.kind === "return_open").map((i) => i.order_id), [visibleIssues]);
  const hasBulk = restockIds.length + discountIds.length + shipIds.length + payIds.length + returnIds.length > 0;
  const filterCounts = useMemo(() => {
    const A = aliveAlerts.filter((a) => alertHasCategory(a, cat)).filter((a) => alertMatchesOzetQuery(a, q));
    const I = aliveIssues.filter((i) => issueHasCategory(i, cat)).filter((i) => issueMatchesOzetQuery(i, q));
    return {
      all: A.length + I.length,
      stock: A.filter((a) => a.kind === "low_stock" || a.kind === "out_of_stock").length,
      slow: A.filter((a) => a.kind === "slow_mover").length,
      unshipped: I.filter((i) => i.kind === "unshipped").length,
      pending_payment: I.filter((i) => i.kind === "pending_payment").length,
      return_open: I.filter((i) => i.kind === "return_open").length,
    } as Record<OzetFilterId, number>;
  }, [aliveAlerts, aliveIssues, cat, q]);
  const urlOn = Boolean((filter && filter !== "all") || cat.trim() || q.trim() || (sort && sort !== "priority"));

  return (
    <div data-cta="ozet-deeplink">
      <div className="filter-rail chips scroll" role="tablist" aria-label="Özet dikkat filtresi" data-cta="ozet-kind-rail" style={{ marginBottom: 12 }}>
        {OZET_FILTERS.map((f) => (
          <button key={f.id} type="button" role="tab" className={`chip ${filter === f.id ? "on" : ""}`} aria-selected={filter === f.id} data-cta="ozet-kind" data-kind={f.id} onClick={() => setFilter(f.id)}>
            {f.label}{filterCounts[f.id] ? ` (${filterCounts[f.id]})` : ""}
          </button>
        ))}
      </div>
      {categories.length ? (
        <div className="filter-rail chips scroll" role="tablist" aria-label="Kategori" data-cta="ozet-category-rail" style={{ marginTop: 0, marginBottom: 12 }}>
          <button className={`chip ${cat === "" ? "on" : ""}`} type="button" aria-pressed={cat === ""} data-cta="ozet-category" data-cat="" onClick={() => setCat("")}>Tüm kategoriler</button>
          {categories.map(([name, n]) => (
            <button key={name} className={`chip ${cat === name ? "on" : ""}`} type="button" aria-pressed={cat === name} data-cta="ozet-category" data-cat={name} onClick={() => setCat(cat === name ? "" : name)}>{name} · {n}</button>
          ))}
        </div>
      ) : null}
      <div className="ops-search" data-cta="ozet-search" style={{ marginTop: 0, marginBottom: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input className="input" type="search" value={q} onChange={(e) => setQ(e.target.value.slice(0, 80))} placeholder="Ara · ürün, sipariş, mesaj…" aria-label="Özet ara" data-cta="ozet-search-input" style={{ flex: "1 1 220px", maxWidth: 420 }} />
        {q.trim() ? <button className="btn btn-sm" type="button" data-cta="ozet-search-clear" onClick={() => setQ("")}>Temizle</button> : null}
        <span className="faint">{q.trim() || cat ? `${visibleAlerts.length + visibleIssues.length} kayıt` : "filtre + kategori üstünde arar"}</span>
      </div>
      <div className="filter-rail chips scroll" role="tablist" aria-label="Sıralama" data-cta="ozet-sort-rail" style={{ marginTop: 0, marginBottom: 12 }}>
        {OZET_SORTS.map((s) => (
          <button key={s.id} type="button" className={`chip ${sort === s.id ? "on" : ""}`} aria-pressed={sort === s.id} data-cta="ozet-sort" data-sort={s.id} onClick={() => setSort(s.id)}>{s.label}</button>
        ))}
      </div>
      {flash ? (
        <p className="muted"><span className="banner-demo">{flash}</span>{" "}<Link href={flashHref}>{flashHref.includes("bekleyen") ? "Bekleyen'e git" : "Siparişler"}</Link></p>
      ) : (
        <p className="muted">
          Toplu yenile/indirim Bekleyen&apos;e · Toplu kargo/ödeme/iade yerel defter · ikas&apos;a gitmez
          {urlOn ? " · URL filtreleri açık" : ""}
          {" · "}
          <button className="chip" type="button" data-cta="ozet-copy-link" onClick={() => void copyLink()}>{copied ? "Kopyalandı" : "Linki kopyala"}</button>
        </p>
      )}
      {hasBulk ? (
        <div className="bulk-bar approve-bar-sticky" role="toolbar">
          {restockIds.length > 0 ? <button className="btn btn-primary" type="button" disabled={busy === "bulk"} onClick={() => void stageRestockAll(restockIds, visibleAlerts)}>{busy === "bulk" ? "…" : `Toplu yenile (${restockIds.length})`}</button> : null}
          {discountIds.length > 0 ? <button className="btn btn-primary" type="button" disabled={busy === "bulk"} onClick={() => void stagePriceAll(discountIds, visibleAlerts)}>{busy === "bulk" ? "…" : `Toplu indirim (${discountIds.length})`}</button> : null}
          {shipIds.length > 0 ? <button className="btn btn-primary" type="button" disabled={busy === "bulk"} onClick={() => void bulkOrders("ship_all", shipIds, "kargolandı")}>{busy === "bulk" ? "…" : `Toplu kargola (${shipIds.length})`}</button> : null}
          {payIds.length > 0 ? <button className="btn btn-primary" type="button" disabled={busy === "bulk"} onClick={() => void bulkOrders("mark_paid_all", payIds, "ödeme alındı")}>{busy === "bulk" ? "…" : `Toplu ödeme alındı (${payIds.length})`}</button> : null}
          {returnIds.length > 0 ? <button className="btn btn-primary" type="button" disabled={busy === "bulk"} onClick={() => void bulkOrders("close_return_all", returnIds, "iade kapandı")}>{busy === "bulk" ? "…" : `Toplu iade kapat (${returnIds.length})`}</button> : null}
          <span className="faint">Özet dikkat listesi · ikas kapalı</span>
        </div>
      ) : null}
      <div className="list">
        {visibleAlerts.map((a) => {
          const isSlow = a.kind === "slow_mover";
          const busyKey = alertKey(a);
          const product = isSlow ? getProduct(a.product_id) : null;
          const catLabel = alertCategory(a);
          const faintHint = isSlow ? (product ? `öneri ${money(suggestPriceCut(product))}` : "indirim önerisi") : `öneri ${suggestRestockQty(a.stock)}`;
          return (
            <div className="list-row" key={busyKey}>
              <div>
                <div>{a.message}</div>
                <div className="faint">{a.product_name}{catLabel ? ` · ${catLabel}` : ""}{a.days_cover != null ? ` · ${a.days_cover} gün cover` : ""}{a.days_without_sale != null ? ` · ${a.days_without_sale} gündür satış yok` : ""}{" · "}{faintHint}</div>
              </div>
              <span className={`tag ${a.kind === "out_of_stock" ? "danger" : "warn"}`}>{a.kind === "out_of_stock" ? "tükendi" : a.kind === "low_stock" ? "düşük stok" : "yavaş"}</span>
              {isSlow ? (
                <button className="btn btn-primary" type="button" disabled={busy === busyKey || busy === "bulk"} onClick={() => void stagePrice(a)}>{busy === busyKey ? "…" : "İndirim"}</button>
              ) : (
                <button className="btn btn-primary" type="button" disabled={busy === busyKey || busy === "bulk"} onClick={() => void stageRestock(a)}>{busy === busyKey ? "…" : "Yenile"}</button>
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
              {cta ? <button className="btn btn-primary" type="button" disabled={busy === i.order_id || busy === "bulk"} onClick={() => void act(i.order_id, cta.action)}>{busy === i.order_id ? "…" : cta.label}</button> : null}
              <Link className="btn" href={`/merchant/siparisler?focus=${encodeURIComponent(i.order_id)}`} data-cta="ozet-issue-order">Sipariş</Link>
              <Link className="btn" href={`/merchant/sohbet?q=${encodeURIComponent(i.order_id)}`}>Sor</Link>
            </div>
          );
        })}
        {visibleAlerts.length === 0 && visibleIssues.length === 0 ? (
          <OzetAttentionEmpty
            totalAlive={aliveAlerts.length + aliveIssues.length}
            filter={filter}
            cat={cat}
            q={q}
            onClearFilters={() => { setQ(""); setCat(""); setFilter("all"); }}
          />
        ) : null}
      </div>
    </div>
  );
}
