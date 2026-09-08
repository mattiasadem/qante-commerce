import type { Alert, Issue } from "@/lib/core";
import { getOrders, getProduct } from "@/lib/core";

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

/** Product category for an Özet alert row. */
export function alertCategory(a: Alert): string {
  return (getProduct(a.product_id)?.category ?? "").trim();
}

export function alertHasCategory(a: Alert, cat: string): boolean {
  const needle = cat.trim();
  if (!needle) return true;
  return alertCategory(a) === needle;
}

/** Distinct product categories on an issue's order lines. */
export function issueCategories(i: Issue): string[] {
  const o = getOrders().find((x) => x.id === i.order_id);
  if (!o) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const it of o.items) {
    const name = (getProduct(it.product_id)?.category ?? "").trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push(name);
  }
  return out;
}

export function issueHasCategory(i: Issue, cat: string): boolean {
  const needle = cat.trim();
  if (!needle) return true;
  return issueCategories(i).includes(needle);
}

/** Case-insensitive match on product / message / kind aliases for Özet alerts. */
export function alertMatchesOzetQuery(a: Alert, q: string): boolean {
  const needle = q.trim().toLocaleLowerCase("tr-TR");
  if (!needle) return true;
  const hay = [a.product_id, a.product_name, a.message ?? "", a.kind, alertCategory(a)]
    .join(" ")
    .toLocaleLowerCase("tr-TR");
  if (hay.includes(needle)) return true;
  const aliases =
    a.kind === "out_of_stock"
      ? "tükendi tukendi"
      : a.kind === "low_stock"
        ? "düşük dusuk stok"
        : a.kind === "slow_mover"
          ? "yavaş yavas indirim"
          : "";
  return needle.length >= 3 && aliases.includes(needle);
}

/** Case-insensitive match on order id / message / kind aliases for Özet issues. */
export function issueMatchesOzetQuery(i: Issue, q: string): boolean {
  const needle = q.trim().toLocaleLowerCase("tr-TR");
  if (!needle) return true;
  const hay = [i.order_id, i.message ?? "", i.kind, String(i.total ?? ""), ...issueCategories(i)]
    .join(" ")
    .toLocaleLowerCase("tr-TR");
  if (hay.includes(needle)) return true;
  const aliases =
    i.kind === "unshipped"
      ? "kargo kargola"
      : i.kind === "pending_payment"
        ? "ödeme odeme"
        : i.kind === "return_open"
          ? "iade"
          : "";
  return needle.length >= 3 && aliases.includes(needle);
}
