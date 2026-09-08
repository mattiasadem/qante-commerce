import { Suspense } from "react";
import { MyOrdersView } from "@/components/ui-my-orders";
import { AssistantRail, AssistantSheet } from "@/components/GenAssistant";

/** Buyer session demo checkouts (ord_demo_*). Local ledger only. URL sync: status/cat/q/sort + Linki kopyala. */
export default function MyOrdersPage() {
  return (
    <div className="shop">
      <Suspense fallback={<p className="muted">siparişlerim…</p>}>
        <MyOrdersView />
      </Suspense>
      <AssistantRail />
      <AssistantSheet />
    </div>
  );
}
