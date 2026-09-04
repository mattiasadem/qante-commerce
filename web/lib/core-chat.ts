import type { ChatResponse, Product, UiBlock } from "@/lib/core-types";
import { money, number, percent, RETURN_DAYS, SHIP_FREE } from "@/lib/core-types";
import { PRODUCTS } from "@/lib/core-art";
import { getProduct, qualityScore } from "@/lib/core-catalog";
import { KEYS, pick } from "@/lib/core-catalog";
import { computeAlerts, computeIssues, computeSnapshot } from "@/lib/core-analytics";

export function demoTurn(message: string, productId?: string | null): ChatResponse {
  const text = message.toLocaleLowerCase("tr-TR");
  const ids: string[] = productId ? [productId] : [];
  for (const [k, v] of Object.entries(KEYS)) if (text.includes(k)) ids.push(...v);
  if (!ids.length) ids.push("prod_keten_gomlek", "prod_seramik_vazo", "prod_yun_kazak");
  const compare = /karşılaştır|karsilastir|fark|yoksa/.test(text);
  const products = pick(ids, compare ? 2 : 3);
  const names = products.map((p) => p.name).join(", ");
  let reply: string;
  let activity = "katalogda bakıyorum";
  if (text.includes("iade")) {
    activity = "iade metnine bakıyorum";
    reply = `İade ${RETURN_DAYS} gün. Etiket duruyorsa mağaza veya kargo ile.`;
  } else if (text.includes("kargo")) {
    activity = "kargo eşiğine bakıyorum";
    reply = `Kargo 1–3 iş günü. ${money(SHIP_FREE)} ve üzeri kargo yok.`;
  } else if (text.includes("beden")) {
    activity = "beden ve stok bakıyorum";
    const c = productId ? getProduct(productId) : products[0];
    reply = c?.sizes?.length ? `${c.name} bedenleri ${c.sizes.join(", ")}. Stok ${c.stock} adet.` : `${c?.name ?? "Bu parça"} tek beden. Stok ${c?.stock ?? 0} adet.`;
  } else if (productId) {
    const c = getProduct(productId);
    reply = `${c?.name ?? "Bu parça"} stokta ${c?.stock ?? 0} adet. Yakın üç öneri: ${names}.`;
  } else if (compare) {
    activity = "iki parçayı yan yana koyuyorum";
    reply = `${products[0]?.name} ve ${products[1]?.name} yan yana. Fiyat ve stok kartlarda.`;
  } else {
    reply = `${names} bu aramaya uyuyor. Stok ve fiyat kartlarda.`;
  }
  const ui: UiBlock[] = compare
    ? [{ type: "present_comparison", products }]
    : [{ type: "present_products", products }];
  return { text: reply, ui, suggestions: ["Keten bakıyorum", "Eve bir vazo", "Yün atkı var mı"].slice(0, 3), activity };
}

export function merchantTurn(message: string): ChatResponse {
  const text = message.toLocaleLowerCase("tr-TR");
  const snap = computeSnapshot();
  const alerts = computeAlerts();
  const issues = computeIssues();
  const suggestions = ["Bu hafta ciro", "Stoğu bitmeye yakın", "Açık siparişler"].slice(0, 3);
  if (/stok|yenile|bit/.test(text)) {
    const rows = alerts.slice(0, 5).map((a) => ({ label: a.product_name, value: `${a.stock} adet · ${a.days_cover ?? "—"} gün` }));
    return { text: `Stok uyarısı ${alerts.length} kayıt. Seed katalog, canlı ikas değil.`, ui: [{ type: "present_metrics", rows }], suggestions, activity: "stok uyarısına bakıyorum" };
  }
  if (/sipariş|siparis|iade|ödeme|odeme/.test(text)) {
    const rows = issues.map((i) => ({ label: i.order_id, value: i.message }));
    return { text: `Açık konu ${issues.length}. Durum seed siparişlerinden.`, ui: [{ type: "present_metrics", rows }], suggestions, activity: "sipariş konularına bakıyorum" };
  }
  if (/düzelt|duzelt|başlık|baslik|seo/.test(text)) {
    const p = PRODUCTS.find((x) => text.includes(x.name.toLocaleLowerCase("tr-TR"))) ?? PRODUCTS[0];
    return {
      text: `${p.name} kalite ${qualityScore(p)}. Başlık ve açıklama seed üzerinde; yazma F2 ve ikas kapalı.`,
      ui: [{ type: "present_table", columns: ["Alan", "Değer"], table: [["SKU", p.sku], ["Fiyat", money(p.price)], ["Stok", String(p.stock)], ["Kalite", String(qualityScore(p))]] }],
      suggestions, activity: "liste kaydına bakıyorum",
    };
  }
  const rows = [
    { label: "Ciro", value: money(snap.revenue) },
    { label: "Sipariş", value: number(snap.order_count) },
    { label: "Ort. sepet", value: money(snap.aov) },
    { label: "İptal", value: percent(snap.cancel_rate * 100) },
  ];
  const table = [
    ["Ciro", money(snap.revenue), percent(snap.revenue_delta_pct)],
    ["Sipariş", number(snap.order_count), percent(snap.order_delta_pct)],
    ["Ort. sepet", money(snap.aov), percent(snap.aov_delta_pct)],
  ];
  return {
    text: `Son ${snap.period_days} günde ciro ${money(snap.revenue)}, ${number(snap.order_count)} sipariş, ortalama sepet ${money(snap.aov)}. Dikkat: ${alerts.slice(0, 3).map((a) => a.product_name).join(", ") || "yok"}.`,
    ui: [{ type: "present_metrics", rows }, { type: "present_table", columns: ["Metrik", "Değer", "Δ"], table }],
    suggestions, activity: "özet rakamlara bakıyorum",
  };
}
