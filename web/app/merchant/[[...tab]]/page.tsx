import type { ReactNode } from "react";
import { AlertList, CatalogTable, MerchantChat, MetricCards, MiniBars, OrdersView, StagedQueue, StockView } from "@/components/ui-merchant";
import { MerchantShell } from "@/components/ui-shell";
import { computeAlerts, computeIssues, computeSnapshot, getOrders, getProducts, getStaged, shortDate, weeklyBars } from "@/lib/core";

export const dynamic = "force-dynamic";

export default async function MerchantPage({
  params,
  searchParams,
}: {
  params: Promise<{ tab?: string[] }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const tab = (await params).tab?.[0] ?? "";
  const { q } = await searchParams;
  const current = tab ? `/merchant/${tab}` : "/merchant";
  const snap = computeSnapshot();
  const alerts = computeAlerts();
  const issues = computeIssues();

  let body: ReactNode;
  if (tab === "sohbet") {
    body = <><h1>Sohbet</h1><MerchantChat prefill={q} /></>;
  } else if (tab === "bekleyen") {
    body = <><h1>Bekleyen</h1><StagedQueue initial={getStaged()} /></>;
  } else if (tab === "katalog") {
    body = <><h1>Katalog</h1><p className="muted" style={{ marginTop: -8, marginBottom: 16 }}>12 ürün · seed · kalite skoru içerik ve stok doluluğu</p><CatalogTable products={getProducts()} /></>;
  } else if (tab === "stok") {
    body = <><h1>Stok</h1><p className="muted" style={{ marginTop: -8, marginBottom: 16 }}>Gün cover ve uyarılar. Yenile sohbete gider.</p><StockView alerts={alerts} /></>;
  } else if (tab === "siparisler") {
    body = <><h1>Siparişler</h1><p className="muted" style={{ marginTop: -8, marginBottom: 16 }}>Tüm seed siparişler · Açık filtresi dikkat gerekenleri öne alır · Sor sohbete gider</p><OrdersView orders={getOrders()} issues={issues} /></>;
  } else {
    body = (
      <>
        <h1>Özet</h1>
        <p className="muted" style={{ marginTop: -8, marginBottom: 18 }}>{shortDate(snap.period_start)} — {shortDate(snap.period_end)}</p>
        <MetricCards snap={snap} />
        <MiniBars bars={weeklyBars()} />
        <h2 style={{ marginTop: 28 }}>Dikkat gereken</h2>
        <AlertList alerts={alerts} issues={issues} />
      </>
    );
  }

  return <MerchantShell current={current}>{body}</MerchantShell>;
}
