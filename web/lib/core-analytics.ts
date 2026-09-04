import type { Alert, Issue, Order, OrderLedgerEntry, Snapshot, WeeklyBar } from "@/lib/core-types";
import { shortDate } from "@/lib/core-types";
import { PRODUCTS } from "@/lib/core-art";
import { ORDERS } from "@/lib/core-catalog";

export function mergeOrders(ledger: Record<string, OrderLedgerEntry> = {}, extras: Order[] = []): Order[] {
  const byId = new Map<string, Order>();
  for (const o of ORDERS) byId.set(o.id, o);
  for (const o of extras) {
    if (o?.id && Array.isArray(o.items)) byId.set(o.id, o);
  }
  return [...byId.values()]
    .map((o) => {
      const e = ledger[o.id];
      return e ? { ...o, status: e.status } : o;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/** True for session checkout rows written by /api/cart checkout (local demo). */
export function isStoreCheckoutOrder(id: string) {
  return id.startsWith("ord_demo_");
}

/** Primary operator CTA for a seed/demo order status (local ledger only). */
export function nextOrderAction(status: string): { action: string; label: string } | null {
  if (status === "paid") return { action: "ship", label: "Kargola" };
  if (status === "shipped") return { action: "fulfill", label: "Teslim" };
  if (status === "pending_payment") return { action: "mark_paid", label: "Ödeme alındı" };
  if (status === "return_requested") return { action: "close_return", label: "İade kapat" };
  return null;
}

/** Secondary cancel CTA — paid / ödeme bekliyor only (local ledger). */
export function canCancelOrder(status: string) {
  return status === "paid" || status === "pending_payment";
}

/** Progress steps for buyer confirm page chips. */
export function orderProgress(status: string): { steps: string[]; active: number; cancelled?: boolean } {
  if (status === "cancelled") return { steps: ["Ödeme", "İptal"], active: 1, cancelled: true };
  if (status === "pending_payment") return { steps: ["Ödeme", "Hazırlık", "Kargo", "Teslim"], active: 0 };
  if (status === "paid") return { steps: ["Ödeme", "Hazırlık", "Kargo", "Teslim"], active: 1 };
  if (status === "shipped") return { steps: ["Ödeme", "Hazırlık", "Kargo", "Teslim"], active: 2 };
  if (status === "fulfilled" || status === "return_requested") return { steps: ["Ödeme", "Hazırlık", "Kargo", "Teslim"], active: 3 };
  return { steps: ["Ödeme", "Hazırlık", "Kargo", "Teslim"], active: 1 };
}

export function applyOrderAction(status: string, action: string): string | null {
  if (action === "ship" && status === "paid") return "shipped";
  if (action === "fulfill" && status === "shipped") return "fulfilled";
  if (action === "mark_paid" && status === "pending_payment") return "paid";
  if (action === "close_return" && status === "return_requested") return "fulfilled";
  if (action === "cancel" && (status === "paid" || status === "pending_payment")) return "cancelled";
  return null;
}

const REV = new Set(["fulfilled", "shipped", "paid", "return_requested"]);
const iso = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
function stats(start: Date, end: Date) {
  const all = ORDERS.filter((o) => { const c = new Date(o.created_at); return c >= start && c < end; });
  const sel = all.filter((o) => REV.has(o.status));
  const revenue = Math.round(sel.reduce((s, o) => s + o.total, 0) * 100) / 100;
  const order_count = sel.length;
  const denom = all.length || 1;
  return { revenue, order_count, aov: order_count ? Math.round((revenue / order_count) * 100) / 100 : 0, cancel_rate: Math.round((all.filter((o) => o.status === "cancelled").length / denom) * 10000) / 10000, refund_rate: Math.round((all.filter((o) => o.status === "return_requested").length / denom) * 10000) / 10000 };
}
const dlt = (c: number, p: number) => (p === 0 ? (c === 0 ? 0 : 100) : Math.round(((c - p) / p) * 1000) / 10);
export function computeSnapshot(now = new Date(), days = 30): Snapshot {
  const end = now, start = new Date(end.getTime() - days * 86400000), prev = new Date(start.getTime() - days * 86400000);
  const cur = stats(start, end), pr = stats(prev, start);
  return { period_start: iso(start), period_end: iso(end), period_days: days, ...cur, revenue_delta_pct: dlt(cur.revenue, pr.revenue), order_delta_pct: dlt(cur.order_count, pr.order_count), aov_delta_pct: dlt(cur.aov, pr.aov) };
}
export function weeklyBars(now = new Date(), weeks = 8): WeeklyBar[] {
  const out: WeeklyBar[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const end = new Date(now.getTime() - i * 7 * 86400000);
    const start = new Date(end.getTime() - 7 * 86400000);
    const { revenue } = stats(start, end);
    out.push({ label: shortDate(start).replace(/ \d{4}$/, ""), value: revenue });
  }
  return out;
}
export function computeAlerts(now = new Date()): Alert[] {
  const a: Alert[] = [];
  for (const p of PRODUCTS) {
    let sold = 0, latest: Date | null = null;
    for (const o of ORDERS) {
      const c = new Date(o.created_at);
      if (REV.has(o.status) && c >= new Date(now.getTime() - 30 * 86400000) && c < now) for (const i of o.items) if (i.product_id === p.id) sold += i.qty;
      if (o.items.some((i) => i.product_id === p.id) && (!latest || c > latest)) latest = c;
    }
    const daily = sold / 30, days_cover = daily <= 0 ? null : Math.round((p.stock / daily) * 10) / 10, days_without_sale = latest ? Math.floor((now.getTime() - latest.getTime()) / 86400000) : null;
    if (p.stock <= 0) { a.push({ kind: "out_of_stock", product_id: p.id, product_name: p.name, stock: p.stock, days_cover: 0, days_without_sale, message: `${p.name} tükendi.` }); continue; }
    if (p.stock <= 5 || (days_cover !== null && days_cover < 7)) a.push({ kind: "low_stock", product_id: p.id, product_name: p.name, stock: p.stock, days_cover, days_without_sale, message: `${p.name} stok ${p.stock} adet.` });
    if (days_without_sale !== null && days_without_sale > 45) a.push({ kind: "slow_mover", product_id: p.id, product_name: p.name, stock: p.stock, days_cover, days_without_sale, message: `${p.name} ${days_without_sale} gündür satılmadı.` });
  }
  return a;
}
export function computeIssues(now = new Date(), orders: Order[] = ORDERS): Issue[] {
  const a: Issue[] = [];
  for (const o of orders) {
    const age_hours = Math.round(((now.getTime() - new Date(o.created_at).getTime()) / 3600000) * 10) / 10;
    if (o.status === "paid" && age_hours > 48) a.push({ kind: "unshipped", order_id: o.id, status: o.status, age_hours, total: o.total, message: `${o.id} ${Math.floor(age_hours)} saattir kargoya verilmedi.` });
    else if (o.status === "pending_payment" && age_hours > 24) a.push({ kind: "pending_payment", order_id: o.id, status: o.status, age_hours, total: o.total, message: `${o.id} ödemesi ${Math.floor(age_hours)} saattir bekliyor.` });
    else if (o.status === "return_requested") a.push({ kind: "return_open", order_id: o.id, status: o.status, age_hours, total: o.total, message: `${o.id} iade talebi açık.` });
  }
  return a;
}
