import { Suspense } from "react";
import { OrderConfirm } from "@/components/ui-shop";
import { AssistantRail, AssistantSheet } from "@/components/GenAssistant";
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
