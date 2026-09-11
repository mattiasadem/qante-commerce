import type { Order } from "@/lib/core";
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

/** Checkout preference keys operators can filter by on Siparişler. */
export const PREF_FILTERS: { id: string; label: string }[] = [
  { id: "kupon", label: "Kupon" },
  { id: "bahsis", label: "Bahşiş" },
  { id: "montaj", label: "Montaj" },
  { id: "gizli", label: "Gizlilik" },
  { id: "imza", label: "İmza" },
  { id: "komsu", label: "Komşu" },
  { id: "taksit", label: "Taksit" },
  { id: "odeme", label: "Ödeme" },
  { id: "hediye", label: "Hediye" },
  { id: "ambalaj", label: "Ambalaj" },
  { id: "saat", label: "Saat" },
  { id: "gun", label: "Gün" },
  { id: "hiz", label: "Hız" },
  { id: "sekil", label: "Teslim şekli" },
  { id: "erisim", label: "Erişim" },
  { id: "eko", label: "Eko" },
  { id: "garanti", label: "Garanti" },
  { id: "destek", label: "Destek" },
  { id: "bildirim", label: "Bildirim" },
  { id: "zil", label: "Zil" },
  { id: "foto", label: "Foto" },
  { id: "ara", label: "Ara" },
  { id: "iade", label: "Kolay iade" },
  { id: "alici", label: "Alıcı" },
  { id: "firma", label: "Firma" },
  { id: "talimat", label: "Talimat" },
  { id: "kirilgan", label: "Kırılgan" },
  { id: "kapici", label: "Kapıcı" },
  { id: "sigorta", label: "Sigorta" },
  { id: "paketmatik", label: "Paketmatik" },
];

/** True when buyer_note has `[key]` or `[key:…]`. */
export function orderHasPref(o: Order, key: string): boolean {
  const note = (o.buyer_note ?? "").trim();
  if (!note || !key) return false;
  const needle = "[" + key.toLowerCase();
  const lower = note.toLowerCase();
  let i = 0;
  while ((i = lower.indexOf(needle, i)) !== -1) {
    const after = lower[i + needle.length] ?? "";
    if (after === "]" || after === ":") return true;
    i += 1;
  }
  return false;
}

/** Distinct non-empty product categories on an order's lines. */
export function orderCategories(o: Order): string[] {
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

/** True when any line item's product is in the given category. */
export function orderHasCategory(o: Order, cat: string): boolean {
  const needle = cat.trim();
  if (!needle) return true;
  return orderCategories(o).includes(needle);
}

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

/** Case-insensitive match on id, line items, buyer/ship notes, sku. */
export function orderMatchesQuery(o: Order, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  if (o.id.toLowerCase().includes(needle)) return true;
  if ((o.buyer_note ?? "").toLowerCase().includes(needle)) return true;
  if ((o.ship_note ?? "").toLowerCase().includes(needle)) return true;
  if (String(o.total).includes(needle)) return true;
  if (lineSummary(o).toLowerCase().includes(needle)) return true;
  for (const it of o.items) {
    if (it.product_id.toLowerCase().includes(needle)) return true;
    const p = getProduct(it.product_id);
    if (p?.name.toLowerCase().includes(needle)) return true;
    if (p?.sku?.toLowerCase().includes(needle)) return true;
    if (p?.category?.toLowerCase().includes(needle)) return true;
  }
  return false;
}

export type OrderSortId = "newest" | "oldest" | "total_desc" | "total_asc";

export const ORDER_SORTS: { id: OrderSortId; label: string }[] = [
  { id: "newest", label: "En yeni" },
  { id: "oldest", label: "En eski" },
  { id: "total_desc", label: "Tutar ↓" },
  { id: "total_asc", label: "Tutar ↑" },
];

/** Secondary sort after highlight/open priority. */
export function compareOrdersBySort(a: Order, b: Order, sort: OrderSortId): number {
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
