import type { Alert, Issue, Snapshot, WeeklyBar } from "@/lib/core-types";
import { shortDate } from "@/lib/core-types";
import { PRODUCTS } from "@/lib/core-art";
import { ORDERS } from "@/lib/core-catalog";

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
export function computeIssues(now = new Date()): Issue[] {
  const a: Issue[] = [];
  for (const o of ORDERS) {
    const age_hours = Math.round(((now.getTime() - new Date(o.created_at).getTime()) / 3600000) * 10) / 10;
    if (o.status === "paid" && age_hours > 48) a.push({ kind: "unshipped", order_id: o.id, status: o.status, age_hours, total: o.total, message: `${o.id} ${Math.floor(age_hours)} saattir kargoya verilmedi.` });
    else if (o.status === "pending_payment" && age_hours > 24) a.push({ kind: "pending_payment", order_id: o.id, status: o.status, age_hours, total: o.total, message: `${o.id} ödemesi ${Math.floor(age_hours)} saattir bekliyor.` });
    else if (o.status === "return_requested") a.push({ kind: "return_open", order_id: o.id, status: o.status, age_hours, total: o.total, message: `${o.id} iade talebi açık.` });
  }
  return a;
}
