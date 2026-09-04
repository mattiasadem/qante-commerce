import { CartPageView } from "@/components/ui-shop";
import { AssistantRail, AssistantSheet } from "@/components/GenAssistant";
export default function CartPage() {
  return (
    <div className="shop">
      <CartPageView />
      <AssistantRail />
      <AssistantSheet />
    </div>
  );
}
