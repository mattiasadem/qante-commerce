import type { Guard, LedgerEntry, Product, StagedChange } from "@/lib/core-types";
import { money } from "@/lib/core-types";

const ok = (id: string, label: string): Guard => ({ id, label, ok: true });
export const STAGED: StagedChange[] = [
  {
    id: "chg_price_gomlek", kind: "price", product_id: "prod_keten_gomlek", product_name: "Keten Gömlek",
    staged_by: "ajan", created_at: "2026-09-02T16:40:00+03:00", variant_count: 1,
    before: { fiyat: money(1249.9) }, after: { fiyat: money(1099.9) },
    reason: "Yaz sonu hareket yavaş. %12 indirim, fiyat cap %20 içinde.",
    guardrails: [ok("price", "fiyat sınırı"), ok("discount", "indirim derinliği"), ok("protected", "korunan alan")],
    status: "staged",
  },
  {
    id: "chg_stock_cuzdan", kind: "stock", product_id: "prod_deri_cuzdan", product_name: "Deri Cüzdan",
    staged_by: "ajan", created_at: "2026-09-03T09:10:00+03:00", variant_count: 1,
    before: { stok: "2" }, after: { stok: "24" },
    reason: "Gün cover 4 günün altında. 22 adet yenileme, restock cap 500 altında.",
    guardrails: [ok("restock", "restock boyutu"), ok("protected", "korunan alan")],
    status: "staged",
  },
  {
    id: "chg_price_atki", kind: "price", product_id: "prod_yun_atki", product_name: "Yün Atkı",
    staged_by: "ajan", created_at: "2026-09-03T11:05:00+03:00", variant_count: 1,
    before: { fiyat: money(389) }, after: { fiyat: money(349) },
    reason: "Stok 3, kış yaklaşırken görünürlük için küçük fiyat adımı.",
    guardrails: [ok("price", "fiyat sınırı"), ok("discount", "indirim derinliği"), ok("protected", "korunan alan")],
    status: "staged",
  },

  {
    id: "chg_listing_polo_done", kind: "listing", product_id: "prod_pamuklu_tisort", product_name: "Pamuklu Tişört",
    staged_by: "operatör", created_at: "2026-09-01T14:20:00+03:00", variant_count: 1,
    before: { başlık: "Pamuklu Tişört", açıklama: "Yumuşak pamuk tişört." },
    after: { başlık: "Pamuklu Tişört · Giyim", açıklama: "Yumuşak pamuk tişört. Doğal malzeme, hızlı kargo." },
    reason: "Liste kalite 72. Başlık ve açıklama netleştirme; yazma F2 ve ikas kapalı.",
    guardrails: [ok("listing", "liste alanı"), ok("protected", "korunan alan")],
    status: "applied",
    decision_note: "yerel onay · demo",
  },
  {
    id: "chg_price_canta_rej", kind: "price", product_id: "prod_ipek_fular", product_name: "İpek Fular",
    staged_by: "ajan", created_at: "2026-09-01T18:00:00+03:00", variant_count: 1,
    before: { fiyat: money(329.5) }, after: { fiyat: money(259.5) },
    reason: "Derin indirim denemesi. Cap %20 dışında kaldı.",
    guardrails: [ok("price", "fiyat sınırı"), { id: "discount", label: "indirim derinliği", ok: false }, ok("protected", "korunan alan")],
    status: "discarded",
    decision_note: "cap dışı · demo",
  },
];
export const getStaged = () => STAGED;

/** Suggest a restock target for an alert row (local demo only). */
export function suggestRestockQty(stock: number) {
  if (stock <= 0) return 24;
  if (stock <= 5) return Math.min(500, stock + 22);
  return Math.min(500, stock + 12);
}

export function buildStockStage(product: Product, targetQty?: number): StagedChange {
  const after = targetQty ?? suggestRestockQty(product.stock);
  const add = Math.max(0, after - product.stock);
  return {
    id: `chg_stock_${product.id}_${Date.now().toString(36)}`,
    kind: "stock",
    product_id: product.id,
    product_name: product.name,
    staged_by: "operatör",
    created_at: new Date().toISOString(),
    variant_count: 1,
    before: { stok: String(product.stock) },
    after: { stok: String(after) },
    reason: product.stock <= 0
      ? `${product.name} tükendi. ${after} adet yenileme önerisi, restock cap 500 altında.`
      : `Gün cover düşük. ${add} adet yenileme (${product.stock} → ${after}), restock cap 500 altında.`,
    guardrails: [ok("restock", "restock boyutu"), ok("protected", "korunan alan")],
    status: "staged",
  };
}

/** Suggest a price cut within the 20% demo cap (local only). */
export function suggestPriceCut(product: Product) {
  const floor = Math.round(product.price * 0.8 * 10) / 10;
  const pct = product.compare_at && product.compare_at > product.price ? 0.92 : 0.88;
  let next = Math.round(product.price * pct * 10) / 10;
  if (next >= product.price) next = Math.max(floor, Math.round((product.price - 40) * 10) / 10);
  return Math.max(floor, Math.min(product.price - 0.1, next));
}

export function buildPriceStage(product: Product, targetPrice?: number): StagedChange {
  const after = targetPrice ?? suggestPriceCut(product);
  const before = product.price;
  const drop = Math.max(0, Math.round((1 - after / before) * 1000) / 10);
  return {
    id: `chg_price_${product.id}_${Date.now().toString(36)}`,
    kind: "price",
    product_id: product.id,
    product_name: product.name,
    staged_by: "operatör",
    created_at: new Date().toISOString(),
    variant_count: 1,
    before: { fiyat: money(before) },
    after: { fiyat: money(after) },
    reason: drop >= 10
      ? `Hareket yavaş. %${drop} indirim önerisi, fiyat cap %20 içinde.`
      : `Küçük fiyat adımı (%${drop}). Cap %20; yazma F2 ve ikas kapalı.`,
    guardrails: [ok("price", "fiyat sınırı"), ok("discount", "indirim derinliği"), ok("protected", "korunan alan")],
    status: "staged",
  };
}

export function suggestListingCopy(product: Product) {
  const title = product.name.includes("·") ? product.name : `${product.name} · ${product.category}`;
  const base = product.description.replace(/\s+/g, " ").trim();
  const description = base.length < 52
    ? `${base}${base.endsWith(".") ? "" : "."} Doğal malzeme, hızlı kargo.`
    : (base.endsWith(".") ? base : `${base}.`) + " Stok ve beden mağazada.";
  return { title, description };
}

export function buildListingStage(product: Product): StagedChange {
  const next = suggestListingCopy(product);
  const q = Math.max(12, Math.min(98, 48
    + (product.description.length > 36 ? 12 : 0)
    + (product.stock > 0 ? 14 : -8)
    + (product.compare_at ? 8 : 0)
    + (product.colors?.length ? 8 : 0)
    + (product.sizes?.length ? 6 : 0)
    + (product.gallery.length >= 2 ? 4 : 0)));
  return {
    id: `chg_listing_${product.id}_${Date.now().toString(36)}`,
    kind: "listing",
    product_id: product.id,
    product_name: product.name,
    staged_by: "operatör",
    created_at: new Date().toISOString(),
    variant_count: 1,
    before: { başlık: product.name, açıklama: product.description.slice(0, 96) },
    after: { başlık: next.title, açıklama: next.description.slice(0, 96) },
    reason: `Liste kalite ${q}. Başlık ve açıklama netleştirme önerisi; yazma F2 ve ikas kapalı.`,
    guardrails: [ok("listing", "liste alanı"), ok("protected", "korunan alan")],
    status: "staged",
  };
}

export function mergeStaged(ledger: Record<string, LedgerEntry> = {}, extras: StagedChange[] = []) {
  const byId = new Map<string, StagedChange>();
  for (const c of [...STAGED, ...extras]) byId.set(c.id, c);
  return [...byId.values()].map((c) => {
    const e = ledger[c.id];
    if (!e) return c;
    return { ...c, status: e.status, decision_note: e.decision_note };
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
export const KIND_LABEL: Record<string, string> = { price: "Fiyat güncellemesi", stock: "Stok yenileme", listing: "Liste düzeltmesi" };
export const STATUS_LABEL: Record<string, string> = { paid: "ödeme alındı", pending_payment: "ödeme bekliyor", return_requested: "iade açık", fulfilled: "teslim", cancelled: "iptal", shipped: "kargoda" };
