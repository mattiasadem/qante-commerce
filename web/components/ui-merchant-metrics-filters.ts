import type { Alert, Issue } from "@/lib/core";

export type OzetFilterId = "all" | "stock" | "slow" | "unshipped" | "pending_payment" | "return_open";

export const OZET_FILTERS: { id: OzetFilterId; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "stock", label: "Stok" },
  { id: "slow", label: "Yavaş" },
  { id: "unshipped", label: "Kargo" },
  { id: "pending_payment", label: "Ödeme" },
  { id: "return_open", label: "İade" },
];

export function alertKey(a: Alert) {
  return `${a.kind}:${a.product_id}`;
}

export function alertMatchesOzet(a: Alert, filter: OzetFilterId) {
  if (filter === "all") return true;
  if (filter === "stock") return a.kind === "low_stock" || a.kind === "out_of_stock";
  if (filter === "slow") return a.kind === "slow_mover";
  return false;
}

export function issueMatchesOzet(i: Issue, filter: OzetFilterId) {
  if (filter === "all") return true;
  if (filter === "unshipped" || filter === "pending_payment" || filter === "return_open") return i.kind === filter;
  return false;
}

export function issueAction(kind: string): { action: string; label: string } | null {
  if (kind === "unshipped") return { action: "ship", label: "Kargola" };
  if (kind === "pending_payment") return { action: "mark_paid", label: "Ödeme alındı" };
  if (kind === "return_open") return { action: "close_return", label: "İade kapat" };
  return null;
}
