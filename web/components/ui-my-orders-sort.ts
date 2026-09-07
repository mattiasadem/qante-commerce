"use client";

export type MyOrderSortId = "newest" | "oldest" | "total_desc" | "total_asc";

export type MyOrderSortRow = {
  order_id: string;
  created_at: string;
  total: number;
};

export const MY_ORDER_SORTS: { id: MyOrderSortId; label: string }[] = [
  { id: "newest", label: "En yeni" },
  { id: "oldest", label: "En eski" },
  { id: "total_desc", label: "Tutar ↓" },
  { id: "total_asc", label: "Tutar ↑" },
];

export function compareMyOrdersBySort(a: MyOrderSortRow, b: MyOrderSortRow, sort: MyOrderSortId): number {
  if (sort === "oldest") {
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  }
  if (sort === "total_desc") {
    const d = (b.total ?? 0) - (a.total ?? 0);
    if (d !== 0) return d;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }
  if (sort === "total_asc") {
    const d = (a.total ?? 0) - (b.total ?? 0);
    if (d !== 0) return d;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}
