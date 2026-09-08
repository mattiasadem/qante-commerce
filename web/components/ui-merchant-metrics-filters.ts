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

export type OzetSortId = "priority" | "name" | "stock" | "age";

export const OZET_SORTS: { id: OzetSortId; label: string }[] = [
  { id: "priority", label: "Öncelik" },
  { id: "name", label: "Ada göre" },
  { id: "stock", label: "Stok ↑" },
  { id: "age", label: "En eski" },
];

function alertSeverity(a: Alert): number {
  if (a.kind === "out_of_stock") return 0;
  if (a.kind === "low_stock") return 1;
  if (a.kind === "slow_mover") return 2;
  return 3;
}

function issueSeverity(i: Issue): number {
  if (i.kind === "unshipped") return 0;
  if (i.kind === "pending_payment") return 1;
  if (i.kind === "return_open") return 2;
  return 3;
}

/** Sort Özet alerts within the visible list. */
export function compareAlertsBySort(a: Alert, b: Alert, sort: OzetSortId): number {
  if (sort === "name") {
    return a.product_name.localeCompare(b.product_name, "tr") || a.product_id.localeCompare(b.product_id);
  }
  if (sort === "stock") {
    return a.stock - b.stock || a.product_name.localeCompare(b.product_name, "tr");
  }
  if (sort === "age") {
    // higher days_without_sale first; else lower days_cover; nulls last
    if (a.days_without_sale != null || b.days_without_sale != null) {
      const da = a.days_without_sale ?? -1;
      const db = b.days_without_sale ?? -1;
      if (da !== db) return db - da;
    } else if (a.days_cover != null || b.days_cover != null) {
      const ca = a.days_cover ?? 9999;
      const cb = b.days_cover ?? 9999;
      if (ca !== cb) return ca - cb;
    }
    return alertSeverity(a) - alertSeverity(b) || a.product_name.localeCompare(b.product_name, "tr");
  }
  // priority
  const s = alertSeverity(a) - alertSeverity(b);
  if (s) return s;
  if (a.kind === "slow_mover") {
    const da = a.days_without_sale ?? 0;
    const db = b.days_without_sale ?? 0;
    return db - da || a.product_name.localeCompare(b.product_name, "tr");
  }
  return a.stock - b.stock || a.product_name.localeCompare(b.product_name, "tr");
}

/** Sort Özet issues within the visible list. */
export function compareIssuesBySort(a: Issue, b: Issue, sort: OzetSortId): number {
  if (sort === "name") {
    return a.order_id.localeCompare(b.order_id, "tr");
  }
  if (sort === "stock") {
    // no stock on issues — fall back to total desc then id
    return b.total - a.total || a.order_id.localeCompare(b.order_id, "tr");
  }
  if (sort === "age") {
    return b.age_hours - a.age_hours || a.order_id.localeCompare(b.order_id, "tr");
  }
  // priority
  const s = issueSeverity(a) - issueSeverity(b);
  if (s) return s;
  return b.age_hours - a.age_hours || b.total - a.total || a.order_id.localeCompare(b.order_id, "tr");
}
