import type { Guard, LedgerEntry, StagedChange } from "@/lib/core-types";
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
];
export const getStaged = () => STAGED;
export function mergeStaged(ledger: Record<string, LedgerEntry> = {}) {
  return STAGED.map((c) => {
    const e = ledger[c.id];
    if (!e) return c;
    return { ...c, status: e.status, decision_note: e.decision_note };
  });
}
export const KIND_LABEL: Record<string, string> = { price: "Fiyat güncellemesi", stock: "Stok yenileme", listing: "Liste düzeltmesi" };
export const STATUS_LABEL: Record<string, string> = { paid: "ödeme alındı", pending_payment: "ödeme bekliyor", return_requested: "iade açık", fulfilled: "teslim", cancelled: "iptal", shipped: "kargoda" };
