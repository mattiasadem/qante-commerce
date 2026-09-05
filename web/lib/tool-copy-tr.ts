/** Turkish activity-line wrapper. Do not edit vendor/tool-copy.ts. */

const TOOL_TR: Record<string, string> = {
  search_catalog: "Katalogda arıyorum…",
  search_products: "Katalogda arıyorum…",
  check_inventory: "Stok ve fiyatı doğruluyorum…",
  get_product_details: "Ürün detayına bakıyorum…",
  search_policies: "İade ve kargo metnine bakıyorum…",
  get_cart: "Sepete bakıyorum…",
  add_to_cart: "Sepeti güncelliyorum…",
  find_similar: "Benzerlerini getiriyorum…",
  present_products: "Kartları hazırlıyorum…",
  present_comparison: "Seçenekleri yan yana koyuyorum…",
  present_suggestions: "Sonraki adımları yazıyorum…",
  get_business_snapshot: "Özet rakamlara bakıyorum…",
  get_inventory_alerts: "Stok uyarısına bakıyorum…",
  get_order_issues: "Sipariş konularına bakıyorum…",
  present_digest: "Dikkat listesini derliyorum…",
  present_change_preview: "Değişiklik önizlemesini hazırlıyorum…",
  stage_price_change: "Fiyat değişikliğini Bekleyen’e yazıyorum…",
  stage_inventory_action: "Stok yenilemesini Bekleyen’e yazıyorum…",
};

export function describeToolTr(tool: string, query?: string): string {
  const base = TOOL_TR[tool] ?? (tool.startsWith("present_") ? "Yanıtı hazırlıyorum…" : tool.startsWith("stage_") ? "Değişikliği Bekleyen’e yazıyorum…" : "Çalışıyorum…");
  const q = (query ?? "").trim();
  if (q && (tool === "search_products" || tool === "search_policies")) {
    return `${base.replace(/…$/, "")} · “${q}”`;
  }
  return base;
}

export const SHOP_ACTIVITY_DEFAULT = [
  "Katalogda arıyorum…",
  "Stok ve fiyatı doğruluyorum…",
  "Kartları hazırlıyorum…",
];

export const MERCHANT_ACTIVITY_DEFAULT = [
  "Özet rakamlara bakıyorum…",
  "Dikkat listesini derliyorum…",
];
