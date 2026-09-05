import type { ChatResponse, Product } from "@/lib/core-types";
import { PRODUCTS } from "@/lib/core-art";
import { getProduct, relatedTo, pick } from "@/lib/core-catalog";

function matchProduct(text: string): Product | undefined {
  return PRODUCTS.find((x) => text.includes(x.name.toLocaleLowerCase("tr-TR")));
}

/** PDP GenUI "Benzerlerini getir" — relatedTo excludes current SKU. */
export function similarTurn(message: string, productId?: string | null): ChatResponse | null {
  const text = message.toLocaleLowerCase("tr-TR");
  const similar = /benzer|yakın|yakin|alternatif/.test(text);
  const compare = /karşılaştır|karsilastir|fark|yoksa/.test(text);
  if (!similar || compare) return null;

  const focus = productId ? getProduct(productId) : matchProduct(text);
  const related = focus ? relatedTo(focus.id, 4) : [];
  const products = related.length ? related : pick(["prod_keten_gomlek", "prod_seramik_vazo", "prod_yun_kazak"], 3);
  const names = products.map((p) => p.name).join(", ");
  const cat = focus?.category ?? products[0]?.category ?? "katalog";
  const reasons = products.map((p, i) => {
    if (focus && p.category === focus.category) {
      if (p.stock <= 0) return `${cat} rafında · tükendi — yine de benzer.`;
      if (i === 0) return `${cat} · aynı raftan en yakın.`;
      return `${cat} · doku ve fiyat yakını.`;
    }
    if (p.stock <= 0) return "Şu an tükendi; benzerini kartlarda tuttum.";
    if (i === 0) return "Aramana en yakın eşleşme.";
    return `${p.category} · stok ${p.stock}`;
  });
  const items = products.map((product, i) => ({ product, reason: reasons[i] }));
  return {
    text: focus
      ? `${focus.name} için ${cat} rafından benzerler: ${names}. Kartlar akışla gelir.`
      : `Benzer parçalar: ${names}. Stok ve fiyat kartlarda.`,
    ui: [{ type: "present_products", title: "Benzerleri", layout: "carousel", products, items }],
    suggestions: ["Bunları karşılaştır", "Bunu sepete ekle", "İade nasıl"],
    activity: "Benzerlerini getiriyorum…",
    activity_steps: [
      "Ürünü okuyorum…",
      "Aynı raftan benzer bakıyorum…",
      "Kartları damla damla getiriyorum…",
    ],
    add_product_id: null,
  };
}
