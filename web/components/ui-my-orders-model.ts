"use client";
import type { MyOrderSortId } from "@/components/ui-my-orders-sort";

export type Row = {
  order_id: string;
  created_at: string;
  status: string;
  total: number;
  item_count: number;
  ship_note?: string;
  items: { product_id: string; name: string; qty: number }[];
};

export type FilterId = "all" | "pending_payment" | "paid" | "shipped" | "fulfilled" | "cancelled" | "return_requested";
export type LedgerAction = "mark_paid" | "fulfill" | "cancel" | "request_return" | "withdraw_return";

export const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "pending_payment", label: "Ödeme bekliyor" },
  { id: "paid", label: "Ödeme alındı" },
  { id: "shipped", label: "Kargoda" },
  { id: "fulfilled", label: "Teslim" },
  { id: "cancelled", label: "İptal" },
  { id: "return_requested", label: "İade açık" },
];

export const ACTION_FLASH: Record<LedgerAction, string> = {
  mark_paid: "Ödeme alındı · yerel defter · ikas'a gitmedi",
  fulfill: "Teslim alındı · yerel defter · ikas'a gitmedi",
  cancel: "Sipariş iptal · yerel defter · ikas'a gitmedi",
  request_return: "İade talebi yerel deftere yazıldı · ikas'a gitmedi",
  withdraw_return: "İade talebi geri alındı · yerel defter · ikas'a gitmedi",
};

export function fmtWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function statusTagClass(status: string) {
  if (status === "cancelled" || status === "return_requested") return "danger";
  if (status === "fulfilled") return "ok";
  if (status === "shipped") return "warn";
  return "ok";
}

export type { MyOrderSortId };
