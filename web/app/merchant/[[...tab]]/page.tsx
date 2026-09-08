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
  const current =
    tab === "ozet" || !tab ? "/merchant" : `/merchant/${tab}`;
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
        <Head title="Bekleyen" lede="Onay kuyruğu. URL yazar (kind/cat/q/sort/hist) + Linki kopyala · Toplu onayla yerel deftere yazar; canlı ikas yazımı kapalı." />
        <Suspense fallback={<p className="muted">bekleyen…</p>}>
          <StagedQueue initial={getStaged()} />
        </Suspense>
      </>
    );
  } else if (tab === "katalog") {
    body = (
      <>
        <Head title="Katalog" lede="12 ürün. Filtre + URL (filter/cat/q/sort) + toplu aksiyonlar yerel Bekleyen kuyruğuna yazar." />
        <Suspense fallback={<p className="muted">katalog…</p>}>
          <CatalogTable products={getProducts()} />
        </Suspense>
      </>
    );
  } else if (tab === "stok") {
    body = (
      <>
        <Head title="Stok" lede="Uyarı kümesi. URL yazar (filter/cat/q/sort) + Linki kopyala · Toplu yenile/indirim yerel kuyruğa yazar; Onayla ikas'a gitmez." />
        <Suspense fallback={<p className="muted">stok…</p>}>
          <StockView alerts={alerts} />
        </Suspense>
      </>
    );
  } else if (tab === "siparisler") {
    body = (
      <>
        <Head title="Siparişler" lede="Mağaza checkout + seed. URL (filter/pref/cat/q/sort/focus) + Kargola ve toplu aksiyonlar yerel deftere yazar; ikas'a gitmez." />
        <Suspense fallback={<p className="muted">siparişler…</p>}>
          <OrdersView orders={getOrders()} issues={issues} />
        </Suspense>
      </>
    );
  } else {
    body = (
      <>
        <Head
          title="Özet"
          lede={`${shortDate(snap.period_start)} — ${shortDate(snap.period_end)} · son ${snap.period_days} gün · URL (kind/cat/q/sort) + Linki kopyala`}
        />
        <MetricCards snap={snap} />
        <MiniBars bars={weeklyBars()} />
        <h2 className="section-label">Dikkat gereken</h2>
        <Suspense fallback={<p className="muted">özet…</p>}>
          <AlertList alerts={alerts} issues={issues} />
        </Suspense>
      </>
    );
  }

  return <MerchantShell current={current}>{body}</MerchantShell>;
}
