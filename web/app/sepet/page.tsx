import { AssistantRail, AssistantSheet, CartPageView } from "@/components/ui-shop";
export default function CartPage() {
  return (
    <div className="shop">
      <CartPageView />
      <AssistantRail />
      <AssistantSheet />
    </div>
  );
}
