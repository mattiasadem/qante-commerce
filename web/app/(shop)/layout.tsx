import type { ReactNode } from "react";
import { StoreShell } from "@/components/StoreShell";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return <StoreShell>{children}</StoreShell>;
}
