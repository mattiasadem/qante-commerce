import type { ChatAction, ChatResponse, Product, UiBlock } from "@/lib/core-types";
import { money, number, percent, RETURN_DAYS, SHIP_FREE } from "@/lib/core-types";
import { PRODUCTS } from "@/lib/core-art";
import { getProduct, qualityScore } from "@/lib/core-catalog";
import { KEYS, pick } from "@/lib/core-catalog";
import { computeAlerts, computeIssues, computeSnapshot } from "@/lib/core-analytics";
import { suggestPriceCut, suggestRestockQty } from "@/lib/core-staged";

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

function matchProduct(text: string): Product | undefined {
  return PRODUCTS.find((x) => text.includes(x.name.toLocaleLowerCase("tr-TR")));
}

function stockActions(alerts: ReturnType<typeof computeAlerts>): ChatAction[] {
  return alerts.slice(0, 3).map((a) => ({
    label: `Yenile · ${a.product_name}`,
    kind: "stock" as const,
    product_id: a.product_id,
    target_qty: suggestRestockQty(a.stock),
  }));
}

export function merchantTurn(message: string): ChatResponse {
  const text = message.toLocaleLowerCase("tr-TR");
  const snap = computeSnapshot();
  const alerts = computeAlerts();
  const issues = computeIssues();
  const named = matchProduct(text);

  if (/stok|yenile|bit/.test(text)) {
    const focus = named ? alerts.filter((a) => a.product_id === named.id) : alerts;
    const rows = (focus.length ? focus : alerts).slice(0, 5).map((a) => ({
      label: a.product_name,
      value: `${a.stock} adet · ${a.days_cover ?? "—"} gün`,
    }));
    const actions = named
      ? [{ label: `Yenile · ${named.name}`, kind: "stock" as const, product_id: named.id, target_qty: suggestRestockQty(named.stock) }]
      : stockActions(alerts);
    return {
      text: named
        ? `${named.name} stok ${named.stock} adet. Yenile yerel Bekleyen kuyruğuna yazar; Onayla ikas'a gitmez.`
        : `Stok uyarısı ${alerts.length} kayıt. Seed katalog, canlı ikas değil.`,
      ui: [{ type: "present_metrics", rows }],
      suggestions: ["Bu hafta ciro", "Açık siparişler", named ? `${named.name} başlığını düzelt` : "Stoğu bitmeye yakın"].slice(0, 3),
      activity: "stok uyarısına bakıyorum",
      actions,
    };
  }

  if (/sipariş|siparis|iade|ödeme|odeme/.test(text)) {
    const rows = issues.map((i) => ({ label: i.order_id, value: i.message }));
    return {
      text: `Açık konu ${issues.length}. Durum seed siparişlerinden; Siparişler sekmesinde CTAlar çalışır.`,
      ui: [{ type: "present_metrics", rows }],
      suggestions: ["Bu hafta ciro", "Stoğu bitmeye yakın", "Açık siparişler"],
      activity: "sipariş konularına bakıyorum",
    };
  }

  if (/düzelt|duzelt|başlık|baslik|seo|liste/.test(text)) {
    const p = named ?? PRODUCTS[0];
    return {
      text: `${p.name} kalite ${qualityScore(p)}. Düzelt yerel Bekleyen'e yazar; yazma F2 ve ikas kapalı.`,
      ui: [{ type: "present_table", columns: ["Alan", "Değer"], table: [["SKU", p.sku], ["Fiyat", money(p.price)], ["Stok", String(p.stock)], ["Kalite", String(qualityScore(p))]] }],
      suggestions: ["Stoğu bitmeye yakın", `${p.name} indirim`, "Bu hafta ciro"],
      activity: "liste kaydına bakıyorum",
      actions: [
        { label: `Düzelt · ${p.name}`, kind: "listing", product_id: p.id },
        { label: `İndirim · ${p.name}`, kind: "price", product_id: p.id, target_price: suggestPriceCut(p) },
      ],
    };
  }

  if (/indirim|fiyat|ucuz/.test(text)) {
    const p = named ?? PRODUCTS.find((x) => x.compare_at) ?? PRODUCTS[0];
    const next = suggestPriceCut(p);
    return {
      text: `${p.name} şu an ${money(p.price)}. Öneri ${money(next)} (%20 cap). İndirim Bekleyen'e yazar.`,
      ui: [{ type: "present_table", columns: ["Alan", "Değer"], table: [["Şimdi", money(p.price)], ["Öneri", money(next)], ["Stok", String(p.stock)]] }],
      suggestions: ["Stoğu bitmeye yakın", `${p.name} başlığını düzelt`, "Bu hafta ciro"],
      activity: "fiyat önerisine bakıyorum",
      actions: [{ label: `İndirim · ${p.name}`, kind: "price", product_id: p.id, target_price: next }],
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
  const topAlert = alerts[0];
  return {
    text: `Son ${snap.period_days} günde ciro ${money(snap.revenue)}, ${number(snap.order_count)} sipariş, ortalama sepet ${money(snap.aov)}. Dikkat: ${alerts.slice(0, 3).map((a) => a.product_name).join(", ") || "yok"}.`,
    ui: [{ type: "present_metrics", rows }, { type: "present_table", columns: ["Metrik", "Değer", "Δ"], table }],
    suggestions: ["Stoğu bitmeye yakın", "Açık siparişler", topAlert ? `${topAlert.product_name} stok yenile` : "Bu hafta ciro"],
    activity: "özet rakamlara bakıyorum",
    actions: topAlert
      ? [{ label: `Yenile · ${topAlert.product_name}`, kind: "stock", product_id: topAlert.product_id, target_qty: suggestRestockQty(topAlert.stock) }]
      : undefined,
  };
}
