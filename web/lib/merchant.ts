import type { Alert, Issue, Order, Snapshot } from "@/lib/types";
import { getOrders, getProducts } from "@/lib/seed";

const REVENUE = new Set(["fulfilled", "shipped", "paid", "return_requested"]);
const TZ = "Europe/Istanbul";

const THRESHOLDS = {
  low_stock_days_cover: 7,
  low_stock_absolute: 5,
  slow_mover_no_sale_days: 45,
  unshipped_hours: 48,
  pending_payment_hours: 24,
};

function parse(iso: string): Date {
  return new Date(iso);
}

function isoDate(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function inWindow(created: Date, start: Date, end: Date): boolean {
  return created >= start && created < end;
}

function stats(orders: Order[], start: Date, end: Date) {
  const all = orders.filter((o) => inWindow(parse(o.created_at), start, end));
  const selected = all.filter((o) => REVENUE.has(o.status));
  const cancelled = all.filter((o) => o.status === "cancelled");
  const refunds = all.filter((o) => o.status === "return_requested");
  const revenue = Math.round(selected.reduce((s, o) => s + o.total, 0) * 100) / 100;
  const order_count = selected.length;
  const aov = order_count ? Math.round((revenue / order_count) * 100) / 100 : 0;
  const denom = all.length || 1;
  return {
    revenue,
    order_count,
    aov,
    cancel_rate: Math.round((cancelled.length / denom) * 10000) / 10000,
    refund_rate: Math.round((refunds.length / denom) * 10000) / 10000,
  };
}

function delta(current: number, previous: number): number {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function computeSnapshot(now = new Date(), periodDays = 30): Snapshot {
  const end = now;
  const start = new Date(end.getTime() - periodDays * 86400000);
  const prevStart = new Date(start.getTime() - periodDays * 86400000);
  const orders = getOrders();
  const current = stats(orders, start, end);
  const previous = stats(orders, prevStart, start);
  return {
    period_start: isoDate(start),
    period_end: isoDate(end),
    period_days: periodDays,
    revenue: current.revenue,
    order_count: current.order_count,
    aov: current.aov,
    cancel_rate: current.cancel_rate,
    refund_rate: current.refund_rate,
    revenue_delta_pct: delta(current.revenue, previous.revenue),
    order_delta_pct: delta(current.order_count, previous.order_count),
    aov_delta_pct: delta(current.aov, previous.aov),
  };
}

function lastSale(productId: string, orders: Order[]): Date | null {
  let latest: Date | null = null;
  for (const order of orders) {
    if (!REVENUE.has(order.status)) continue;
    if (!order.items.some((i) => i.product_id === productId)) continue;
    const created = parse(order.created_at);
    if (!latest || created > latest) latest = created;
  }
  return latest;
}

function sold30(productId: string, orders: Order[], now: Date): number {
  const start = new Date(now.getTime() - 30 * 86400000);
  let total = 0;
  for (const order of orders) {
    if (!REVENUE.has(order.status)) continue;
    const created = parse(order.created_at);
    if (created < start || created >= now) continue;
    for (const item of order.items) {
      if (item.product_id === productId) total += item.qty;
    }
  }
  return total;
}

export function computeAlerts(now = new Date()): Alert[] {
  const products = getProducts();
  const orders = getOrders();
  const alerts: Alert[] = [];
  for (const product of products) {
    const stock = product.stock;
    const sold = sold30(product.id, orders, now);
    const daily = sold / 30;
    const days_cover = daily <= 0 ? null : Math.round((stock / daily) * 10) / 10;
    const last = lastSale(product.id, orders);
    const days_without_sale = last ? Math.floor((now.getTime() - last.getTime()) / 86400000) : null;
    if (stock <= 0) {
      alerts.push({
        kind: "out_of_stock",
        product_id: product.id,
        product_name: product.name,
        stock,
        days_cover: 0,
        days_without_sale,
        message: `${product.name} tükendi.`,
      });
      continue;
    }
    const low =
      stock <= THRESHOLDS.low_stock_absolute ||
      (days_cover !== null && days_cover < THRESHOLDS.low_stock_days_cover);
    if (low) {
      alerts.push({
        kind: "low_stock",
        product_id: product.id,
        product_name: product.name,
        stock,
        days_cover,
        days_without_sale,
        message: `${product.name} stok ${stock} adet.`,
      });
    }
    if (days_without_sale !== null && days_without_sale > THRESHOLDS.slow_mover_no_sale_days) {
      alerts.push({
        kind: "slow_mover",
        product_id: product.id,
        product_name: product.name,
        stock,
        days_cover,
        days_without_sale,
        message: `${product.name} ${days_without_sale} gündür satılmadı.`,
      });
    }
  }
  return alerts;
}

export function computeIssues(now = new Date()): Issue[] {
  const issues: Issue[] = [];
  for (const order of getOrders()) {
    const created = parse(order.created_at);
    const age_hours = Math.round(((now.getTime() - created.getTime()) / 3600000) * 10) / 10;
    if (order.status === "paid" && age_hours > THRESHOLDS.unshipped_hours) {
      issues.push({
        kind: "unshipped",
        order_id: order.id,
        status: order.status,
        age_hours,
        total: order.total,
        message: `${order.id} ${Math.floor(age_hours)} saattir kargoya verilmedi.`,
      });
    } else if (order.status === "pending_payment" && age_hours > THRESHOLDS.pending_payment_hours) {
      issues.push({
        kind: "pending_payment",
        order_id: order.id,
        status: order.status,
        age_hours,
        total: order.total,
        message: `${order.id} ödemesi ${Math.floor(age_hours)} saattir bekliyor.`,
      });
    } else if (order.status === "return_requested") {
      issues.push({
        kind: "return_open",
        order_id: order.id,
        status: order.status,
        age_hours,
        total: order.total,
        message: `${order.id} iade talebi açık.`,
      });
    }
  }
  return issues;
}
