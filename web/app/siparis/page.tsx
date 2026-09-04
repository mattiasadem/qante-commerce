import { Suspense } from "react";
import { OrderConfirm } from "@/components/ui-order-confirm";
import { AssistantRail, AssistantSheet } from "@/components/GenAssistant";

/** Buyer iptal/iade stay on OrderConfirm (local ledger). GenAssistant rail is read-only policy/compare help. */
export default function OrderPage() {
  return (
    <div className="shop">
      <Suspense fallback={<div className="grid-wrap"><p className="muted">sipariş</p></div>}>
        <OrderConfirm />
      </Suspense>
      <AssistantRail />
      <AssistantSheet />
    </div>
  );
}
