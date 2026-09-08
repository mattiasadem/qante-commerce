'use client';
import type { StagedChange } from "@/lib/core";
import { KIND_LABEL, getProduct } from "@/lib/core";

export type KindFilter = "all" | "price" | "stock" | "listing";
export type HistoryFilter = "all" | "applied" | "discarded";

export const KIND_FILTERS: { id: KindFilter; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "price", label: "Fiyat" },
  { id: "stock", label: "Stok" },
  { id: "listing", label: "Liste" },
];

export const HISTORY_FILTERS: { id: HistoryFilter; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "applied", label: "Uygulandı" },
  { id: "discarded", label: "Reddedildi" },
];

export type StagedSortId = "newest" | "oldest" | "name" | "kind";

export const STAGED_SORTS: { id: StagedSortId; label: string }[] = [
  { id: "newest", label: "En yeni" },
  { id: "oldest", label: "En eski" },
  { id: "name", label: "Ürün A→Z" },
  { id: "kind", label: "Tür" },
];

const KIND_RANK: Record<string, number> = { price: 0, stock: 1, listing: 2 };


export function changeCategory(c: StagedChange): string {
  return (getProduct(c.product_id)?.category ?? "").trim();
}

export function compareChangesBySort(a: StagedChange, b: StagedChange, sort: StagedSortId): number {
  if (sort === "oldest") {
    const d = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (d !== 0) return d;
    return a.product_name.localeCompare(b.product_name, "tr");
  }
  if (sort === "name") {
    const d = a.product_name.localeCompare(b.product_name, "tr");
    if (d !== 0) return d;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }
  if (sort === "kind") {
    const d = (KIND_RANK[a.kind] ?? 9) - (KIND_RANK[b.kind] ?? 9);
    if (d !== 0) return d;
    return a.product_name.localeCompare(b.product_name, "tr");
  }
  // newest (default)
  const d = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  if (d !== 0) return d;
  return a.product_name.localeCompare(b.product_name, "tr");
}

/** Case-insensitive match on id, product, reason, staged_by, before/after, decision note. */
export function changeMatchesQuery(c: StagedChange, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  if (c.id.toLowerCase().includes(needle)) return true;
  if (c.product_id.toLowerCase().includes(needle)) return true;
  if (c.product_name.toLowerCase().includes(needle)) return true;
  if (changeCategory(c).toLowerCase().includes(needle)) return true;
  if (c.staged_by.toLowerCase().includes(needle)) return true;
  if (c.reason.toLowerCase().includes(needle)) return true;
  if ((c.decision_note ?? "").toLowerCase().includes(needle)) return true;
  if ((KIND_LABEL[c.kind] ?? c.kind).toLowerCase().includes(needle)) return true;
  if (c.kind.toLowerCase().includes(needle)) return true;
  for (const [k, v] of Object.entries(c.before)) {
    if (k.toLowerCase().includes(needle) || String(v).toLowerCase().includes(needle)) return true;
  }
  for (const [k, v] of Object.entries(c.after)) {
    if (k.toLowerCase().includes(needle) || String(v).toLowerCase().includes(needle)) return true;
  }
  for (const g of c.guardrails) {
    if (g.label.toLowerCase().includes(needle) || g.id.toLowerCase().includes(needle)) return true;
  }
  return false;
}
