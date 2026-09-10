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
  { id: "hediye", label: "Hediye" },
  { id: "ambalaj", label: "Ambalaj" },
  { id: "saat", label: "Saat" },
  { id: "erisim", label: "Erişim" },
  { id: "eko", label: "Eko" },
  { id: "garanti", label: "Garanti" },
  { id: "firma", label: "Firma" },
  { id: "kirilgan", label: "Kırılgan" },
  { id: "kapici", label: "Kapıcı" },
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
  }).join(", ");
}
