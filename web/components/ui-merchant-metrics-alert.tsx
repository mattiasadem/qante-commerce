"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Alert, Issue } from "@/lib/core";
import { getProduct, money, suggestPriceCut, suggestRestockQty } from "@/lib/core";
import {
  OZET_FILTERS,
  alertKey,
  alertMatchesOzet,
  issueAction,
  issueMatchesOzet,
  type OzetFilterId,
} from "@/components/ui-merchant-metrics-filters";
import { useOzetAlertActions } from "@/components/ui-merchant-metrics-actions";

export function AlertList({ alerts, issues }: { alerts: Alert[]; issues: Issue[] }) {
  const [filter, setFilter] = useState<OzetFilterId>("all");
  const {
    busy, flash, flashHref, visibleAlerts: aliveAlerts, visibleIssues: aliveIssues,
    act, bulkOrders, stageRestock, stagePrice, stageRestockAll, stagePriceAll,
  } = useOzetAlertActions(alerts, issues, filter);

  const visibleAlerts = useMemo(
    () => aliveAlerts.filter((a) => alertMatchesOzet(a, filter)),
    [aliveAlerts, filter],
  );
  const visibleIssues = useMemo(
    () => aliveIssues.filter((i) => issueMatchesOzet(i, filter)),
    [aliveIssues, filter],
  );

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

  const filterCounts = useMemo(() => {
    const c: Record<OzetFilterId, number> = {
      all: aliveAlerts.length + aliveIssues.length,
      stock: aliveAlerts.filter((a) => a.kind === "low_stock" || a.kind === "out_of_stock").length,
      slow: aliveAlerts.filter((a) => a.kind === "slow_mover").length,
      unshipped: aliveIssues.filter((i) => i.kind === "unshipped").length,
      pending_payment: aliveIssues.filter((i) => i.kind === "pending_payment").length,
      return_open: aliveIssues.filter((i) => i.kind === "return_open").length,
    };
    return c;
  }, [aliveAlerts, aliveIssues]);

  return (
    <>
      <div className="filter-rail chips scroll" role="tablist" aria-label="Özet dikkat filtresi" data-cta="ozet-kind-rail" style={{ marginBottom: 12 }}>
        {OZET_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            className={`chip ${filter === f.id ? "on" : ""}`}
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            {filterCounts[f.id] ? ` (${filterCounts[f.id]})` : ""}
          </button>
        ))}
      </div>
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
            <button className="btn btn-primary" type="button" disabled={busy === "bulk"} onClick={() => void stageRestockAll(restockIds, visibleAlerts)}>
              {busy === "bulk" ? "…" : `Toplu yenile (${restockIds.length})`}
            </button>
          ) : null}
          {discountIds.length > 0 ? (
            <button className="btn btn-primary" type="button" disabled={busy === "bulk"} onClick={() => void stagePriceAll(discountIds, visibleAlerts)}>
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
