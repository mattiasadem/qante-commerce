import type { ChatAction, ChatResponse, Product, UiBlock } from "@/lib/core-types";
import { money, number, percent, RETURN_DAYS, SHIP_FREE } from "@/lib/core-types";
import { PRODUCTS } from "@/lib/core-art";
import { getProduct, qualityScore } from "@/lib/core-catalog";
import { KEYS, pick } from "@/lib/core-catalog";
import { computeAlerts, computeIssues, computeSnapshot } from "@/lib/core-analytics";
import { getStaged, KIND_LABEL, suggestPriceCut, suggestRestockQty } from "@/lib/core-staged";
import type { DigestItem } from "@/lib/core-types";

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
  const reasons = products.map((p, i) => {
    if (p.stock <= 0) return "Şu an tükendi; benzerini kartlarda tuttum.";
    if (p.stock <= 5) return `Stok ${p.stock} — hızlı tükeniyor.`;
    if (i === 0) return "Aramana en yakın eşleşme.";
    if (p.tags.includes("yaz")) return "Yazlık doku ve rahat kesim.";
    if (p.tags.includes("kış")) return "Mevsimlik sıcak tutar.";
    return "Katalog fiyatı · seed stok.";
  });
  const items = products.map((product, i) => ({ product, reason: reasons[i] }));
  let activity_steps = ["Ürünleri arıyorum…", "Stoka bakıyorum…", "Kartları hazırlıyorum…"];
  if (text.includes("iade")) activity_steps = ["İade metnine bakıyorum…", "Kartları hazırlıyorum…"];
  else if (text.includes("kargo")) activity_steps = ["Kargo eşiğine bakıyorum…", "Kartları hazırlıyorum…"];
  else if (text.includes("beden")) activity_steps = ["Ürünleri arıyorum…", "Stoka bakıyorum…"];
  else if (compare) activity_steps = ["Ürünleri arıyorum…", "İki parçayı yan yana koyuyorum…"];
  const addIntent = /sepete ekle|sepetime|bunu sepete/.test(text) || (text.includes("ekle") && !/bekleyen|yenile|indirim/.test(text));
  let add_product_id: string | null = addIntent ? (productId || products[0]?.id || null) : null;
  if (add_product_id) {
    const p = getProduct(add_product_id);
    if (!p || p.stock <= 0) add_product_id = null;
    else {
      activity = "Sepete ekliyorum…";
      activity_steps = ["Ürünleri arıyorum…", "Sepete ekliyorum…"];
      reply = `${p.name} sepete eklendi. Rozet sağ üstte güncellenir.`;
    }
  }
  if (!add_product_id && activity === "katalogda bakıyorum") activity = "Ürünleri arıyorum…";
  const ui: UiBlock[] = compare
    ? [{
        type: "present_comparison",
        title: "Yan yana",
        products,
        entries: products.map((product, i) => ({
          product_id: product.id,
          product,
          best_for: i === 0 ? "Önerilen" : "Alternatif",
          pros: [reasons[i], product.stock > 0 ? `stok ${product.stock}` : "tükendi"].slice(0, 2),
          cons: product.stock <= 3 ? ["stok dar"] : ["tek varyant odaklı"],
        })),
        recommended_product_id: products[0]?.id,
      }]
    : [{ type: "present_products", title: "Öneriler", layout: "carousel", products, items }];
  const suggestions = add_product_id
    ? ["Keten bakıyorum", "Eve bir vazo", "Yün atkı var mı"]
    : ["Bunları karşılaştır", "Bunu sepete ekle", "İade nasıl"];
  return { text: reply, ui, suggestions: suggestions.slice(0, 3), activity, activity_steps, add_product_id };
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
  const staged = getStaged().filter((c) => c.status === "staged");

  if (/bekleyen|onay|değişiklik|degisiklik/.test(text) && staged[0]) {
    const change = staged.find((c) => named && c.product_id === named.id) ?? staged[0];
    const digestItems: DigestItem[] = [
      ...alerts.slice(0, 3).map((a) => ({
        kind: (a.kind === "out_of_stock" ? "out_of_stock" : a.kind === "slow_mover" ? "slow_mover" : "low_stock") as DigestItem["kind"],
        headline: a.message,
        why: a.days_cover != null ? `Cover ${a.days_cover} gün` : undefined,
        ref_id: a.product_id,
        product_name: a.product_name,
      })),
      ...staged.slice(0, 2).map((c) => ({
        kind: "pending_change" as const,
        headline: `${KIND_LABEL[c.kind] ?? c.kind} · ${c.product_name}`,
        why: "Onay bekliyor",
        ref_id: c.id,
      })),
    ];
    return {
      text: `${change.product_name} için ${KIND_LABEL[change.kind] ?? change.kind} onay bekliyor. Onayla yalnızca yerel deftere yazar; ikas kapalı.`,
      ui: [
        { type: "present_digest", digest: { title: "Dikkat", items: digestItems } },
        { type: "present_change_preview", change, headline: KIND_LABEL[change.kind] ?? change.kind, note: change.reason },
      ],
      suggestions: ["Stoğu bitmeye yakın", "Bu hafta ciro", "Açık siparişler"],
      activity: "Bekleyen değişikliklere bakıyorum…",
      activity_steps: ["Özet rakamlara bakıyorum…", "Bekleyen değişikliklere bakıyorum…"],
    };
  }

  if (/stok|yenile|bit/.test(text)) {
    const focus = named ? alerts.filter((a) => a.product_id === named.id) : alerts;
    const rows = (focus.length ? focus : alerts).slice(0, 5).map((a) => ({
      label: a.product_name,
      value: `${a.stock} adet · ${a.days_cover ?? "—"} gün`,
    }));
    const actions = named
      ? [{ label: `Yenile · ${named.name}`, kind: "stock" as const, product_id: named.id, target_qty: suggestRestockQty(named.stock) }]
      : stockActions(alerts);
    const digestItems: DigestItem[] = (focus.length ? focus : alerts).slice(0, 5).map((a) => ({
      kind: (a.kind === "out_of_stock" ? "out_of_stock" : a.kind === "slow_mover" ? "slow_mover" : "low_stock") as DigestItem["kind"],
      headline: a.message,
      why: a.days_cover != null ? `Cover ${a.days_cover} gün` : undefined,
      ref_id: a.product_id,
      product_name: a.product_name,
    }));
    return {
      text: named
        ? `${named.name} stok ${named.stock} adet. Yenile yerel Bekleyen kuyruğuna yazar; Onayla ikas'a gitmez.`
        : `Stok uyarısı ${alerts.length} kayıt. Seed katalog, canlı ikas değil.`,
      ui: [
        { type: "present_digest", digest: { title: "Stok dikkat", items: digestItems } },
        { type: "present_metrics", rows },
      ],
      suggestions: ["Bu hafta ciro", "Bekleyen değişiklikler", named ? `${named.name} başlığını düzelt` : "Stoğu bitmeye yakın"].slice(0, 3),
      activity: "Stoka bakıyorum…",
      activity_steps: ["Stoka bakıyorum…", "Dikkat listesini derliyorum…"],
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
  const digestItems: DigestItem[] = [
    ...alerts.slice(0, 4).map((a) => ({
      kind: (a.kind === "out_of_stock" ? "out_of_stock" : a.kind === "slow_mover" ? "slow_mover" : "low_stock") as DigestItem["kind"],
      headline: a.message,
      why: a.days_cover != null ? `Cover ${a.days_cover} gün` : undefined,
      ref_id: a.product_id,
      product_name: a.product_name,
    })),
    ...issues.slice(0, 2).map((i) => ({
      kind: "order_issue" as const,
      headline: i.message,
      why: money(i.total),
      ref_id: i.order_id,
    })),
    ...staged.slice(0, 1).map((c) => ({
      kind: "pending_change" as const,
      headline: `${KIND_LABEL[c.kind] ?? c.kind} · ${c.product_name}`,
      why: "Onay bekliyor",
      ref_id: c.id,
    })),
  ];
  return {
    text: `Son ${snap.period_days} günde ciro ${money(snap.revenue)}, ${number(snap.order_count)} sipariş, ortalama sepet ${money(snap.aov)}. Dikkat: ${alerts.slice(0, 3).map((a) => a.product_name).join(", ") || "yok"}.`,
    ui: [
      { type: "present_metrics", rows },
      { type: "present_digest", digest: { title: "Dikkat", items: digestItems.slice(0, 6) } },
      ...(staged[0] ? [{ type: "present_change_preview", change: staged[0], headline: KIND_LABEL[staged[0].kind] ?? staged[0].kind, note: staged[0].reason } as UiBlock] : []),
      { type: "present_table", columns: ["Metrik", "Değer", "Δ"], table },
    ],
    suggestions: ["Stoğu bitmeye yakın", "Bekleyen değişiklikler", topAlert ? `${topAlert.product_name} stok yenile` : "Bu hafta ciro"],
    activity: "Özet rakamlara bakıyorum…",
    activity_steps: ["Özet rakamlara bakıyorum…", "Dikkat listesini derliyorum…"],
    actions: topAlert
      ? [{ label: `Yenile · ${topAlert.product_name}`, kind: "stock", product_id: topAlert.product_id, target_qty: suggestRestockQty(topAlert.stock) }]
      : undefined,
  };
}
