import { Suspense } from "react";
import { OrdersView } from "@/components/ui-merchant";
import { MerchantShell } from "@/components/ui-shell";
import { computeIssues, getOrders } from "@/lib/core";

export const dynamic = "force-dynamic";

export default function SiparislerPage() {
  return (
    <MerchantShell current="/merchant/siparisler">
      <header className="ops-head">
        <h1>Siparişler</h1>
        <p className="lede">
          Mağaza checkout + seed. URL (filter/pref/cat/q/sort/focus) + Kargola ve toplu aksiyonlar yerel deftere yazar; ikas'a gitmez.
        </p>
      </header>
      <Suspense fallback={<p className="muted">siparişler…</p>}>
        <OrdersView orders={getOrders()} issues={computeIssues()} />
      </Suspense>
    </MerchantShell>
  );
}
