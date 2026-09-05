import { MyOrdersView } from "@/components/ui-my-orders";
import { AssistantRail, AssistantSheet } from "@/components/GenAssistant";

/** Buyer session demo checkouts (ord_demo_*). Local ledger only. */
export default function MyOrdersPage() {
  return (
    <div className="shop">
      <MyOrdersView />
      <AssistantRail />
      <AssistantSheet />
    </div>
  );
}
