import { Suspense } from "react";
import { AlertList, MetricCards, MiniBars } from "@/components/ui-merchant";
import { MerchantShell } from "@/components/MerchantShell";
import { computeAlerts, computeIssues, computeSnapshot, shortDate, weeklyBars } from "@/lib/core";

export const dynamic = "force-dynamic";

export default function MerchantHome() {
  const snap = computeSnapshot();
  const alerts = computeAlerts();
  const issues = computeIssues();
  return (
    <MerchantShell current="/merchant">
      <header className="ops-head">
        <h1>Özet</h1>
        <p className="lede">
          {shortDate(snap.period_start)} — {shortDate(snap.period_end)} · son {snap.period_days} gün · URL (kind/cat/q/sort) + Linki kopyala
        </p>
      </header>
      <MetricCards snap={snap} />
      <MiniBars bars={weeklyBars()} />
      <h2 className="section-label">Dikkat gereken</h2>
      <Suspense fallback={<p className="muted">özet…</p>}>
        <AlertList alerts={alerts} issues={issues} />
      </Suspense>
    </MerchantShell>
  );
}
