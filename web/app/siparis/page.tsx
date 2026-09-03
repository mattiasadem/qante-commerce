import { Suspense } from "react";
import { AssistantRail, AssistantSheet, OrderConfirm } from "@/components/ui-shop";
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
