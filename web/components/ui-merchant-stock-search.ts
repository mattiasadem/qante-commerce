"use client";
import type { Alert } from "@/lib/core";

/** Case-insensitive match on product name, id, message, kind. */
export function alertMatchesQuery(a: Alert, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  if (a.product_id.toLowerCase().includes(needle)) return true;
  if (a.product_name.toLowerCase().includes(needle)) return true;
  if ((a.message ?? "").toLowerCase().includes(needle)) return true;
  if (a.kind.toLowerCase().includes(needle)) return true;
  const kindAliases =
    a.kind === "out_of_stock" ? "tükendi tukendi" :
    a.kind === "low_stock" ? "düşük dusuk" :
    a.kind === "slow_mover" ? "yavaş yavas" : "";
  if (needle.length >= 3 && kindAliases.includes(needle)) return true;
  return false;
}

export type StockSortId = "urgency" | "stock_asc" | "name" | "cover_asc";

export const STOCK_SORTS: { id: StockSortId; label: string }[] = [
  { id: "urgency", label: "Öncelik" },
  { id: "stock_asc", label: "Stok ↑" },
  { id: "name", label: "Ad A→Z" },
  { id: "cover_asc", label: "Cover ↑" },
];

function urgencyRank(kind: string): number {
  if (kind === "out_of_stock") return 0;
  if (kind === "low_stock") return 1;
  if (kind === "slow_mover") return 2;
  return 9;
}

export function compareAlertsBySort(a: Alert, b: Alert, sort: StockSortId): number {
  if (sort === "stock_asc") {
    const d = a.stock - b.stock;
    if (d !== 0) return d;
    return a.product_name.localeCompare(b.product_name, "tr");
  }
  if (sort === "cover_asc") {
    const ac = a.days_cover ?? 9999;
    const bc = b.days_cover ?? 9999;
    const d = ac - bc;
    if (d !== 0) return d;
    return a.product_name.localeCompare(b.product_name, "tr");
  }
  if (sort === "name") {
    return a.product_name.localeCompare(b.product_name, "tr");
  }
  const d = urgencyRank(a.kind) - urgencyRank(b.kind);
  if (d !== 0) return d;
  const sd = a.stock - b.stock;
  if (sd !== 0) return sd;
  return a.product_name.localeCompare(b.product_name, "tr");
}
