import { AlertList } from "@/components/AlertList";
import { MerchantShell } from "@/components/MerchantShell";
import { MetricCards } from "@/components/MetricCards";
import { computeAlerts, computeIssues, computeSnapshot } from "@/lib/merchant";

export const dynamic = "force-dynamic";

export default function MerchantHome() {
  const snap = computeSnapshot();
  const alerts = computeAlerts();
  const issues = computeIssues();
  return (
    <MerchantShell current="/merchant">
      <h1>Özet</h1>
      <p className="muted" style={{ marginTop: -8, marginBottom: 18 }}>
        {snap.period_start} — {snap.period_end}
      </p>
      <MetricCards snap={snap} />
      <h2 style={{ marginTop: 28 }}>Dikkat gereken</h2>
      <AlertList alerts={alerts} issues={issues} />
    </MerchantShell>
  );
}
