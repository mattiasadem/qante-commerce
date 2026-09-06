import { Suspense } from "react";
import { AssistantRail, AssistantSheet, OrderConfirm } from "@/components/ui-shop";
import { PaymentSummaryBanner } from "@/components/ui-payment-summary";
import { ShipSlotSummaryBanner } from "@/components/ui-ship-slot-summary";
import { InvoiceSummaryBanner } from "@/components/ui-invoice-summary";
import { ContactSummaryBanner } from "@/components/ui-contact-summary";
import { ShipInstrSummaryBanner } from "@/components/ui-ship-instr-summary";
import { ShipDaySummaryBanner } from "@/components/ui-ship-day-summary";
import { ShipCarrierSummaryBanner } from "@/components/ui-ship-carrier-summary";
import { TaksitSummaryBanner } from "@/components/ui-taksit-summary";
import { ShipModeSummaryBanner } from "@/components/ui-ship-mode-summary";
import { ShipSpeedSummaryBanner } from "@/components/ui-ship-speed-summary";
import { TipSummaryBanner } from "@/components/ui-tip-summary";
import { EcoSummaryBanner } from "@/components/ui-eco-summary";
import { RecipientSummaryBanner } from "@/components/ui-recipient-summary";
import { DoormanSummaryBanner } from "@/components/ui-doorman-summary";
import { InsuranceSummaryBanner } from "@/components/ui-insurance-summary";
import { NotifySummaryBanner } from "@/components/ui-notify-summary";
import { QuietSummaryBanner } from "@/components/ui-quiet-summary";
import { CallSummaryBanner } from "@/components/ui-call-summary";
export default function OrderPage() {
  return (
    <div className="shop">
      <Suspense fallback={<div className="grid-wrap"><p className="muted">sipariş</p></div>}>
        <div className="grid-wrap" style={{ maxWidth: 720, marginBottom: -8 }}>
          <PaymentSummaryBanner />
          <ShipSlotSummaryBanner />
          <InvoiceSummaryBanner />
          <ContactSummaryBanner />
          <ShipInstrSummaryBanner />
          <ShipDaySummaryBanner />
          <ShipCarrierSummaryBanner />
          <TaksitSummaryBanner />
          <ShipModeSummaryBanner />
          <ShipSpeedSummaryBanner />
          <TipSummaryBanner />
          <EcoSummaryBanner />
          <RecipientSummaryBanner />
          <DoormanSummaryBanner />
          <InsuranceSummaryBanner />
          <NotifySummaryBanner />
          <QuietSummaryBanner />
          <CallSummaryBanner />
        </div>
        <OrderConfirm />
      </Suspense>
      <AssistantRail />
      <AssistantSheet />
    </div>
  );
}
