import type { ReactNode } from "react";
import { StoreShell } from "@/components/StoreShell";
import {
  BlueprintStoreShell,
  useAgentTurn,
  COMMERCE_AGENTS_PIN,
} from "@/components/BlueprintBridge";

const _blueprintReady = {
  StoreShell: BlueprintStoreShell,
  useAgentTurn,
  pin: COMMERCE_AGENTS_PIN,
};

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <StoreShell>
      <div data-commerce-agents-pin={_blueprintReady.pin}>{children}</div>
    </StoreShell>
  );
}
