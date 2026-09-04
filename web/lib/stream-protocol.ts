/** Client/server stub for generative UI protocol (SSE → registry). Full Claude runtime optional tonight. */

import type { Product, StagedChange, UiBlock } from "@/lib/core";
import { describeToolTr } from "@/lib/tool-copy-tr";

export type StreamEvent =
  | { type: "tool_call"; tool: string; id: string; label?: string }
  | { type: "progress"; tool_id: string; label: string }
  | { type: "tool_result"; tool: string; id: string }
  | { type: "text_delta"; text: string }
  | { type: "text"; content: string }
  | { type: "ui_partial"; stream_id: string; component: string; payload: unknown; status: "partial" }
  | { type: "ui"; stream_id: string; component: string; payload: unknown; status: "final" }
  | { type: "suggestions"; suggestions: string[] }
  | { type: "actions"; actions: unknown[] }
  | { type: "cart_update"; cart: unknown }
  | { type: "change_update"; change: StagedChange }
  | { type: "activity"; content: string }
  | { type: "turn_complete" }
  | { type: "done" }
  | { type: "error"; message: string };

export type GenProductsPayload = {
  title?: string;
  layout?: "carousel" | "grid" | "list";
  items: { product: Product; reason?: string }[];
};

export type GenComparisonPayload = {
  title?: string;
  recommended_product_id?: string;
  entries: {
    product_id: string;
    product: Product;
    best_for?: string;
    pros?: string[];
    cons?: string[];
  }[];
};

export type GenMetricsPayload = {
  title?: string;
  rows: { label: string; value: string; hint?: string }[];
};

export type GenDigestPayload = {
  title?: string;
  items: {
    kind: "low_stock" | "out_of_stock" | "slow_mover" | "order_issue" | "metric" | "pending_change" | "note";
    headline: string;
    why?: string;
    ref_id?: string;
    product_name?: string;
  }[];
};

export type GenChangePreviewPayload = {
  headline?: string;
  note?: string;
  change: StagedChange;
};

export function blockToComponent(type: string): string {
  if (type === "present_products") return "products";
  if (type === "present_comparison") return "comparison";
  if (type === "present_metrics") return "metrics";
  if (type === "present_digest") return "digest";
  if (type === "present_change_preview") return "change_preview";
  if (type === "present_table") return "metrics";
  return type.replace(/^present_/, "") || type;
}

export function uiBlockToPayload(block: UiBlock): { component: string; payload: unknown } {
  const component = blockToComponent(block.type);
  if (component === "products") {
    const products = block.products ?? [];
    const items =
      block.items ??
      products.map((p) => ({
        product: p,
        reason: p.stock <= 0 ? "Stokta yok — benzer bak" : p.featured ? "Öne çıkan raf" : `${p.category} · stok ${p.stock}`,
      }));
    const payload: GenProductsPayload = {
      title: block.title ?? "Öneriler",
      layout: block.layout ?? (items.length > 3 ? "grid" : "carousel"),
      items,
    };
    return { component, payload };
  }
  if (component === "comparison") {
    const products = block.products ?? [];
    const entries =
      block.entries ??
      products.map((p, i) => ({
        product_id: p.id,
        product: p,
        best_for: i === 0 ? "Önerilen" : "Alternatif",
        pros: [p.category, p.stock > 0 ? `Stok ${p.stock}` : "Tükendi"].filter(Boolean),
        cons: p.compare_at ? ["İndirimli fiyat"] : p.stock <= 2 ? ["Az stok"] : [],
      }));
    const payload: GenComparisonPayload = {
      title: block.title ?? "Yan yana",
      recommended_product_id: block.recommended_product_id ?? entries[0]?.product_id,
      entries,
    };
    return { component, payload };
  }
  if (component === "digest" && block.digest) {
    return { component, payload: block.digest as GenDigestPayload };
  }
  if (component === "change_preview" && block.change) {
    return {
      component,
      payload: {
        headline: block.headline ?? block.change.product_name,
        note: block.note ?? block.change.reason,
        change: block.change,
      } satisfies GenChangePreviewPayload,
    };
  }
  if (component === "metrics") {
    const rows =
      block.rows ??
      (block.table
        ? block.table.map((row) => ({ label: row[0] ?? "", value: row[1] ?? "", hint: row[2] }))
        : []);
    return { component, payload: { title: block.title ?? "Özet", rows } satisfies GenMetricsPayload };
  }
  return { component, payload: block };
}

export function encodeSse(event: StreamEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}

/** Build a paced shopping/merchant turn event list (no network yet). */
export function buildTurnEvents(opts: {
  text: string;
  ui: UiBlock[];
  suggestions: string[];
  activity?: string;
  activity_steps?: string[];
  cart?: unknown;
  change?: StagedChange;
  addProductId?: string | null;
  actions?: unknown[];
}): StreamEvent[] {
  const events: StreamEvent[] = [];
  const labels =
    opts.activity_steps?.length
      ? opts.activity_steps
      : shoppingLabels(opts.activity, opts.ui, Boolean(opts.addProductId));
  labels.forEach((label, i) => {
    const id = `tc_${i}`;
    const tool = i === 0 ? "search_catalog" : "check_inventory";
    events.push({ type: "tool_call", tool, id, label: label || describeToolTr(tool) });
    events.push({ type: "progress", tool_id: id, label });
    events.push({ type: "tool_result", tool: i === 0 ? "search_catalog" : "check_inventory", id });
  });

  const text = opts.text;
  const mid = Math.max(12, Math.floor(text.length / 2));
  events.push({ type: "text_delta", text: text.slice(0, mid) });
  events.push({ type: "text_delta", text: text.slice(mid) });
  events.push({ type: "text", content: text });

  opts.ui.forEach((block, bi) => {
    const stream_id = `ui_${bi}`;
    const { component, payload } = uiBlockToPayload(block);
    if (component === "products") {
      const full = payload as GenProductsPayload;
      const items = full.items ?? [];
      for (let n = 1; n <= items.length; n++) {
        events.push({
          type: "ui_partial",
          stream_id,
          component,
          status: "partial",
          payload: { ...full, items: items.slice(0, n) },
        });
      }
      events.push({ type: "ui", stream_id, component, status: "final", payload: full });
    } else if (component === "comparison") {
      const full = payload as GenComparisonPayload;
      const entries = full.entries ?? [];
      for (let n = 1; n <= entries.length; n++) {
        events.push({
          type: "ui_partial",
          stream_id,
          component,
          status: "partial",
          payload: { ...full, entries: entries.slice(0, n) },
        });
      }
      events.push({ type: "ui", stream_id, component, status: "final", payload: full });
    } else {
      events.push({ type: "ui_partial", stream_id, component, status: "partial", payload });
      events.push({ type: "ui", stream_id, component, status: "final", payload });
    }
  });

  if (opts.cart) events.push({ type: "cart_update", cart: opts.cart });
  if (opts.change) events.push({ type: "change_update", change: opts.change });
  if (opts.suggestions?.length) events.push({ type: "suggestions", suggestions: opts.suggestions });
  if (opts.actions?.length) events.push({ type: "actions", actions: opts.actions });
  events.push({ type: "turn_complete" });
  events.push({ type: "done" });
  return events;
}

function shoppingLabels(activity: string | undefined, ui: UiBlock[], adding: boolean): string[] {
  if (adding) return ["Ürünleri arıyorum…", "Sepete ekliyorum…"];
  if (ui.some((b) => b.type === "present_comparison")) return ["Ürünleri arıyorum…", "İki parçayı yan yana koyuyorum…"];
  if (ui.some((b) => b.type === "present_digest" || b.type === "present_change_preview")) {
    return ["Özet rakamlara bakıyorum…", "Bekleyen değişikliklere bakıyorum…"];
  }
  if (ui.some((b) => b.type === "present_metrics")) return ["Özet rakamlara bakıyorum…", "Stoka bakıyorum…"];
  if (activity?.includes("stok") || activity?.includes("beden")) return ["Ürünleri arıyorum…", "Stoka bakıyorum…"];
  if (activity?.includes("iade")) return ["İade metnine bakıyorum…"];
  if (activity?.includes("kargo")) return ["Kargo eşiğine bakıyorum…"];
  return ["Ürünleri arıyorum…", "Stoka bakıyorum…"];
}

export async function streamEvents(
  events: StreamEvent[],
  write: (chunk: string) => void,
  delaysMs = { tool: 420, drip: 160, text: 90 },
): Promise<void> {
  for (const ev of events) {
    write(encodeSse(ev));
    if (ev.type === "tool_call" || ev.type === "progress") await sleep(delaysMs.tool);
    else if (ev.type === "ui_partial") await sleep(delaysMs.drip);
    else if (ev.type === "text_delta") await sleep(delaysMs.text);
    else await sleep(40);
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
