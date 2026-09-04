export type Swatch = { id: string; name: string; hex: string };
export type Product = {
  id: string; name: string; category: string; price: number; compare_at: number | null;
  stock: number; sku: string; description: string; image: string; gallery: string[];
  tags: string[]; colors?: Swatch[]; sizes?: string[]; featured?: boolean;
};
export type Cart = { items: { product_id: string; qty: number; product: Product | null; line_total: number }[]; subtotal: number; currency: string };
export type Snapshot = { period_start: string; period_end: string; period_days: number; revenue: number; order_count: number; aov: number; cancel_rate: number; refund_rate: number; revenue_delta_pct: number; order_delta_pct: number; aov_delta_pct: number };
export type Alert = { kind: string; product_id: string; product_name: string; stock: number; days_cover: number | null; days_without_sale: number | null; message: string };
export type Issue = { kind: string; order_id: string; status: string; age_hours: number; total: number; message: string };
export type Order = { id: string; created_at: string; status: string; total: number; items: { product_id: string; qty: number; price: number }[] };
export type WeeklyBar = { label: string; value: number };
export type Guard = { id: string; label: string; ok: boolean };
export type StagedChange = {
  id: string; kind: "price" | "stock" | "listing"; product_id: string; product_name: string;
  staged_by: string; created_at: string; variant_count: number;
  before: Record<string, string>; after: Record<string, string>; reason: string;
  guardrails: Guard[]; status: "staged" | "discarded" | "applied"; decision_note?: string;
};
export type LedgerEntry = { status: "applied" | "discarded" | "staged"; decision_note?: string; decided_at?: string };
export type OrderLedgerEntry = { status: string; decided_at?: string; note?: string };
export type DigestItem = {
  kind: "low_stock" | "out_of_stock" | "slow_mover" | "order_issue" | "metric" | "pending_change" | "note";
  headline: string;
  why?: string;
  ref_id?: string;
  product_name?: string;
};
export type ProductPick = { product: Product; reason?: string };
export type CompareEntry = { product_id: string; product: Product; pros?: string[]; cons?: string[]; best_for?: string };
export type UiBlock = {
  type: string;
  layout?: "carousel" | "grid" | "list";
  title?: string;
  products?: Product[];
  items?: ProductPick[];
  entries?: CompareEntry[];
  recommended_product_id?: string;
  dimensions?: string[];
  headline?: string;
  note?: string;
  rows?: { label: string; value: string }[];
  columns?: string[];
  table?: string[][];
  digest?: { title?: string; items: DigestItem[] };
  change?: StagedChange;
};
export type ChatAction = {
  label: string;
  kind: "stock" | "price" | "listing";
  product_id: string;
  target_qty?: number;
  target_price?: number;
};
export type ChatResponse = { text: string; ui: UiBlock[]; suggestions: string[]; activity: string; activity_steps?: string[]; add_product_id?: string | null; actions?: ChatAction[] };

export const money = (n: number) => `${new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} ₺`;
export const number = (n: number, d = 0) => new Intl.NumberFormat("tr-TR", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
export const percent = (n: number) => `${n > 0 ? "+" : ""}${number(n, 1)}%`;
export function shortDate(iso?: string | Date) {
  const d = iso ? new Date(iso) : new Date();
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Istanbul" }).format(d);
}
export function greeting(now = new Date()) {
  const h = Number(new Intl.DateTimeFormat("tr-TR", { hour: "numeric", hour12: false, timeZone: "Europe/Istanbul" }).format(now));
  if (h < 12) return "Günaydın";
  if (h < 18) return "İyi günler";
  return "İyi akşamlar";
}

export const SHIP_FREE = 1500;
export const RETURN_DAYS = 30;
export const IKAS_WRITES_ENABLED = false;
export const CATEGORIES = ["Giyim", "Ev", "Aksesuar", "Yaz", "Kış"] as const;
export const BRAND = {
  name: "Qante", assistant_name: "Qante Asistan", voice: "samimi, kısa, Türkçe",
  tokens: { bg: "#0b0b0b", surface: "#171717", text: "#f3f3f0", muted: "#9a9a94", accent: "#d8c7a6", radius: "12px", grain: "dark" },
  logo: { kind: "square_round_pip" }, ship_free: SHIP_FREE, return_days: RETURN_DAYS, writes_enabled: IKAS_WRITES_ENABLED,
};
export const logoSvg = (s = 32) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 32 32"><rect width="32" height="32" fill="#d8c7a6"/><circle cx="24" cy="24" r="6" fill="#0b0b0b"/></svg>`;
