import type { ReactNode } from "react";
import { Suspense } from "react";
import { AlertList, CatalogTable, MerchantChat, MetricCards, MiniBars, OrdersView, StagedQueue, StockView } from "@/components/ui-merchant";
import { MerchantShell } from "@/components/ui-shell";
import { computeAlerts, computeIssues, computeSnapshot, getOrders, getProducts, getStaged, shortDate, weeklyBars } from "@/lib/core";

export const dynamic = "force-dynamic";

function Head({ title, lede }: { title: string; lede: string }) {
  return (
    <header className="ops-head">
      <h1>{title}</h1>
      <p className="lede">{lede}</p>
    </header>
  );
}

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
    body = (
      <>
        <Head title="Sohbet" lede="Özet, stok ve bekleyen için starter'lar. Yenile / Düzelt / İndirim yerel kuyruğa yazar; Onayla ikas'a gitmez." />
        <MerchantChat prefill={q} />
      </>
    );
  } else if (tab === "bekleyen") {
    body = (
      <>
        <Head title="Bekleyen" lede="Onay kuyruğu. Toplu onayla yerel deftere yazar; canlı ikas yazımı kapalı." />
        <StagedQueue initial={getStaged()} />
      </>
    );
  } else if (tab === "katalog") {
    body = (
      <>
        <Head title="Katalog" lede="12 ürün. Filtre + toplu aksiyonlar yerel Bekleyen kuyruğuna yazar." />
        <CatalogTable products={getProducts()} />
      </>
    );
  } else if (tab === "stok") {
    body = (
      <>
        <Head title="Stok" lede="Uyarı kümesi. Toplu yenile yerel kuyruğa yazar; Onayla ikas'a gitmez." />
        <StockView alerts={alerts} />
      </>
    );
  } else if (tab === "siparisler") {
    body = (
      <>
        <Head title="Siparişler" lede="Mağaza checkout + seed. Kargola ve toplu aksiyonlar yerel deftere yazar." />
        <Suspense fallback={<p className="muted">siparişler…</p>}>
          <OrdersView orders={getOrders()} issues={issues} />
        </Suspense>
      </>
    );
  } else {
    body = (
      <>
        <Head title="Özet" lede={`${shortDate(snap.period_start)} — ${shortDate(snap.period_end)} · son ${snap.period_days} gün`} />
        <MetricCards snap={snap} />
        <MiniBars bars={weeklyBars()} />
        <h2>Dikkat gereken</h2>
        <AlertList alerts={alerts} issues={issues} />
      </>
    );
  }

  return <MerchantShell current={current}>{body}</MerchantShell>;
}
