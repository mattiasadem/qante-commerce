import { Suspense } from "react";
import { StockView } from "@/components/ui-merchant";
import { MerchantShell } from "@/components/ui-shell";
import { computeAlerts } from "@/lib/core";

export const dynamic = "force-dynamic";

export default function StokPage() {
  return (
    <MerchantShell current="/merchant/stok">
      <header className="ops-head">
        <h1>Stok</h1>
        <p className="lede">
          Uyarı kümesi. URL (filter/cat/q/sort) + Toplu yenile/indirim yerel kuyruğa yazar; Onayla ikas'a gitmez.
        </p>
      </header>
      <Suspense fallback={<p className="muted">stok…</p>}>
        <StockView alerts={computeAlerts()} />
      </Suspense>
    </MerchantShell>
  );
}
