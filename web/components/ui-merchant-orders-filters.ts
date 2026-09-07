import type { Issue, Order } from "@/lib/core";
import { getProduct, isStoreCheckoutOrder } from "@/lib/core";

export const ORDER_FILTERS: { id: string; label: string; match: (o: Order, open: Set<string>) => boolean }[] = [
  { id: "all", label: "Tümü", match: () => true },
  { id: "open", label: "Açık", match: (o, open) => open.has(o.id) || (isStoreCheckoutOrder(o.id) && (o.status === "paid" || o.status === "pending_payment" || o.status === "shipped")) },
  { id: "store", label: "Mağaza", match: (o) => isStoreCheckoutOrder(o.id) },
  { id: "paid", label: "Ödeme alındı", match: (o) => o.status === "paid" },
  { id: "pending_payment", label: "Ödeme bekliyor", match: (o) => o.status === "pending_payment" },
  { id: "return_requested", label: "İade", match: (o) => o.status === "return_requested" },
  { id: "shipped", label: "Kargoda", match: (o) => o.status === "shipped" },
  { id: "fulfilled", label: "Teslim", match: (o) => o.status === "fulfilled" },
  { id: "cancelled", label: "İptal", match: (o) => o.status === "cancelled" },
];

export function statusTone(status: string, isOpen: boolean) {
  if (isOpen || status === "return_requested" || status === "pending_payment") return "danger";
  if (status === "paid" || status === "shipped") return "warn";
  if (status === "fulfilled") return "ok";
  if (status === "cancelled") return "danger";
  return "accent";
}

export function lineSummary(o: Order) {
  return o.items.map((it) => {
    const name = getProduct(it.product_id)?.name ?? it.product_id;
    return `${name} ×${it.qty}`;
  }).join(" · ");
}
