import { Suspense } from "react";
import { AssistantRail, AssistantSheet, OrderConfirm } from "@/components/ui-shop";
import { PaymentSummaryBanner } from "@/components/ui-payment-summary";
import { ShipSlotSummaryBanner } from "@/components/ui-ship-slot-summary";
export default function OrderPage() {
  return (
    <div className="shop">
      <Suspense fallback={<div className="grid-wrap"><p className="muted">sipariş</p></div>}>
        <div className="grid-wrap" style={{ maxWidth: 720, marginBottom: -8 }}>
          <PaymentSummaryBanner />
          <ShipSlotSummaryBanner />
        </div>
        <OrderConfirm />
      </Suspense>
      <AssistantRail />
      <AssistantSheet />
    </div>
  );
}
