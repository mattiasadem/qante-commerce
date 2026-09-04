"use client";

import type { StagedChange } from "@/lib/core";
import type {
  GenChangePreviewPayload,
  GenComparisonPayload,
  GenDigestPayload,
  GenMetricsPayload,
  GenProductsPayload,
} from "@/lib/stream-protocol";
import { ActivityLine } from "./ActivityLine";
import { ChangePreviewCard } from "./ChangePreviewCard";
import { ComparisonCard } from "./ComparisonCard";
import { DigestCard } from "./DigestCard";
import { MetricsCard } from "./MetricsCard";
import { ProductsCard } from "./ProductsCard";

export { ActivityLine, ChangePreviewCard, ComparisonCard, DigestCard, MetricsCard, ProductsCard };

export type GenSlot = {
  stream_id: string;
  component: string;
  payload: unknown;
  status: "pending" | "partial" | "final";
};

/** Controlled GenUI registry — maps presentation component name → React view. */
export function GenerativeBlock({
  slot,
  onAsk,
  onChangeResolved,
}: {
  slot: GenSlot;
  onAsk?: (text: string) => void;
  onChangeResolved?: (change: StagedChange) => void;
}) {
  const partial = slot.status !== "final";
  switch (slot.component) {
    case "products":
      return <ProductsCard payload={slot.payload as GenProductsPayload} partial={partial} />;
    case "comparison":
      return <ComparisonCard payload={slot.payload as GenComparisonPayload} partial={partial} />;
    case "metrics":
      return <MetricsCard payload={slot.payload as GenMetricsPayload} partial={partial} />;
    case "digest":
      return <DigestCard payload={slot.payload as GenDigestPayload} onAsk={onAsk} />;
    case "change_preview":
      return (
        <ChangePreviewCard
          payload={slot.payload as GenChangePreviewPayload}
          onResolved={onChangeResolved}
        />
      );
    default:
      return partial ? null : (
        <p className="faint" style={{ marginTop: 8 }}>
          Bu yüzey henüz yok: {slot.component}
        </p>
      );
  }
}
